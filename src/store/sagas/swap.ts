import { all, call, put, select, spawn, takeEvery, takeLatest } from 'typed-redux-saga'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as swapActions } from '@store/reducers/swap'
import { swap } from '@store/selectors/swap'
import { poolsArraySortedByFees, tickMaps, tokens } from '@store/selectors/pools'
import { accounts } from '@store/selectors/solanaWallet'
import { createAccount, getWallet } from './wallet'
import { IWallet, Pair, routingEssentials } from '@invariant-labs/sdk-eclipse'
import { getConnection, handleRpcError } from './connection'
import {
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  SendTransactionError,
  Transaction,
  TransactionExpiredTimeoutError,
  TransactionInstruction,
  VersionedTransaction
} from '@solana/web3.js'
import {
  APPROVAL_DENIED_MESSAGE,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  LEADERBOARD_DECIMAL,
  MAX_CROSSES_IN_SINGLE_TX,
  MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { closeSnackbar } from 'notistack'
import {
  calculatePoints,
  createLoaderKey,
  ensureApprovalDenied,
  ensureError,
  extractErrorCode,
  extractRuntimeErrorCode,
  formatNumberWithoutSuffix,
  mapErrorCodeToMessage,
  printBN
} from '@utils/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import {
  createNativeAtaInstructions,
  createNativeAtaWithTransferInstructions,
  getLookupTableAddresses
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import { PayloadAction } from '@reduxjs/toolkit'
import {
  TICK_CROSSES_PER_IX,
  TwoHopSwap,
  TwoHopSwapCache
} from '@invariant-labs/sdk-eclipse/lib/market'
import { PoolWithAddress } from '@store/reducers/pools'
import nacl from 'tweetnacl'
import { BN } from '@coral-xyz/anchor'
import { ParsedInstruction } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'
import { config, priceFeeds } from '@store/selectors/leaderboard'
import { computeUnitsInstruction } from '@invariant-labs/sdk-eclipse/src'

export function* handleSwapWithETH(): Generator {
  const loaderSwappingTokens = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const tickmaps = yield* select(tickMaps)
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const {
      slippage,
      tokenFrom,
      tokenTo,
      amountIn,
      firstPair,
      estimatedPriceAfterSwap,
      byAmountIn,
      amountOut
    } = yield* select(swap)

    const wallet = yield* call(getWallet)
    const tokensAccounts = yield* select(accounts)
    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    if (!firstPair) {
      return
    }

    const swapPool = allPools.find(
      pool =>
        (tokenFrom.equals(pool.tokenX) &&
          tokenTo.equals(pool.tokenY) &&
          firstPair?.feeTier.fee.eq(pool.fee)) ||
        (tokenFrom.equals(pool.tokenY) &&
          tokenTo.equals(pool.tokenX) &&
          firstPair?.feeTier.fee.eq(pool.fee))
    )

    if (!swapPool) {
      return
    }

    yield put(
      snackbarsActions.add({
        message: 'Swapping tokens...',
        variant: 'pending',
        persist: true,
        key: loaderSwappingTokens
      })
    )

    const isXtoY = tokenFrom.equals(swapPool.tokenX)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)
    const prependendIxs: TransactionInstruction[] = []
    const appendedIxs: TransactionInstruction[] = []

    if (allTokens[tokenFrom.toString()].address.toString() === WRAPPED_ETH_ADDRESS) {
      const { createIx, transferIx, initIx, unwrapIx } = createNativeAtaWithTransferInstructions(
        wrappedEthAccount.publicKey,
        wallet.publicKey,
        net,
        amountIn.toNumber()
      )

      prependendIxs.push(...[createIx, transferIx, initIx])
      appendedIxs.push(unwrapIx)
    } else {
      const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
        wrappedEthAccount.publicKey,
        wallet.publicKey,
        net
      )
      prependendIxs.push(...[createIx, initIx])
      appendedIxs.push(unwrapIx)
    }

    // const initialBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // initialTx.recentBlockhash = initialBlockhash.blockhash
    // initialTx.feePayer = wallet.publicKey

    let fromAddress =
      allTokens[tokenFrom.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[tokenFrom.toString()]
          ? tokensAccounts[tokenFrom.toString()].address
          : null
    if (fromAddress === null) {
      fromAddress = yield* call(createAccount, tokenFrom)
    }
    let toAddress =
      allTokens[tokenTo.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[tokenTo.toString()]
          ? tokensAccounts[tokenTo.toString()].address
          : null
    if (toAddress === null) {
      toAddress = yield* call(createAccount, tokenTo)
    }

    const swapPair = new Pair(tokenFrom, tokenTo, {
      fee: swapPool.fee,
      tickSpacing: swapPool.tickSpacing
    })
    const tickIndexes = marketProgram.findTickIndexesForSwap(
      swapPool,
      tickmaps[swapPool.tickmap.toString()],
      isXtoY,
      MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS
    )

    const luts = getLookupTableAddresses(
      marketProgram,
      new Pair(tokenFrom, tokenTo, {
        fee: swapPool.fee,
        tickSpacing: swapPool.tickSpacing
      }),
      tickIndexes
    )

    let initialTxid: string

    if (luts.length !== 0) {
      const swapTx = yield* call(
        [marketProgram, marketProgram.versionedSwapTx],
        {
          pair: swapPair,
          xToY: isXtoY,
          amount: byAmountIn ? amountIn : amountOut,
          estimatedPriceAfterSwap,
          slippage: slippage,
          accountX: isXtoY ? fromAddress : toAddress,
          accountY: isXtoY ? toAddress : fromAddress,
          byAmountIn: byAmountIn,
          owner: wallet.publicKey
        },
        {
          pool: swapPool,
          tickmap: tickmaps[swapPool.tickmap.toString()],
          tokenXProgram: allTokens[swapPool.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[swapPool.tokenY.toString()].tokenProgram
        },
        { tickIndexes },
        prependendIxs,
        appendedIxs,
        luts
      )

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      const serializedMessage = swapTx.message.serialize()
      const signatureUint8 = nacl.sign.detached(serializedMessage, wrappedEthAccount.secretKey)

      swapTx.addSignature(wrappedEthAccount.publicKey, signatureUint8)

      const initialSignedTx = (yield* call(
        [wallet, wallet.signTransaction],
        swapTx
      )) as VersionedTransaction

      closeSnackbar(loaderSigningTx)
      yield put(snackbarsActions.remove(loaderSigningTx))

      initialTxid = yield* call(
        [connection, connection.sendRawTransaction],
        initialSignedTx.serialize(),
        {
          skipPreflight: false
        }
      )

      yield* call([connection, connection.confirmTransaction], initialTxid)
    } else {
      const setCuIx = computeUnitsInstruction(1_400_000, wallet.publicKey)
      const swapIx = yield* call(
        [marketProgram, marketProgram.swapIx],
        {
          pair: swapPair,
          xToY: isXtoY,
          amount: byAmountIn ? amountIn : amountOut,
          estimatedPriceAfterSwap,
          slippage: slippage,
          accountX: isXtoY ? fromAddress : toAddress,
          accountY: isXtoY ? toAddress : fromAddress,
          byAmountIn: byAmountIn,
          owner: wallet.publicKey
        },
        {
          pool: swapPool,
          tickmap: tickmaps[swapPool.tickmap.toString()],
          tokenXProgram: allTokens[swapPool.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[swapPool.tokenY.toString()].tokenProgram
        },
        { tickCrosses: MAX_CROSSES_IN_SINGLE_TX }
      )
      const tx = new Transaction()
        .add(setCuIx)
        .add(...prependendIxs)
        .add(swapIx)
        .add(...appendedIxs)

      const { blockhash, lastValidBlockHeight } = yield* call([
        connection,
        connection.getLatestBlockhash
      ])
      tx.recentBlockhash = blockhash
      tx.lastValidBlockHeight = lastValidBlockHeight
      tx.feePayer = wallet.publicKey

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      tx.partialSign(wrappedEthAccount)

      const initialSignedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

      closeSnackbar(loaderSigningTx)
      yield put(snackbarsActions.remove(loaderSigningTx))

      initialTxid = yield* call(
        sendAndConfirmRawTransaction,
        connection,
        initialSignedTx.serialize(),
        {
          skipPreflight: false
        }
      )
    }

    if (!initialTxid.length) {
      yield put(swapActions.setSwapSuccess(false))

      closeSnackbar(loaderSwappingTokens)
      yield put(snackbarsActions.remove(loaderSwappingTokens))

      return yield put(
        snackbarsActions.add({
          message: 'ETH wrapping failed. Please try again',
          variant: 'error',
          persist: false,
          txid: initialTxid
        })
      )
    }

    // const swapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   swapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    // if (!swapTxid.length) {
    //   yield put(swapActions.setSwapSuccess(false))

    //   return yield put(
    //     snackbarsActions.add({
    //       message:
    //         'Tokens swapping failed. Please unwrap wrapped ETH in your wallet and try again.',
    //       variant: 'error',
    //       persist: false,
    //       txid: swapTxid
    //     })
    //   )
    // } else {

    const txDetails = yield* call([connection, connection.getParsedTransaction], initialTxid, {
      maxSupportedTransactionVersion: 0
    })

    if (txDetails) {
      if (txDetails.meta?.err) {
        if (txDetails.meta.logMessages) {
          const errorLog = txDetails.meta.logMessages.find(log =>
            log.includes(ErrorCodeExtractionKeys.ErrorNumber)
          )
          const errorCode = errorLog
            ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
            .split(ErrorCodeExtractionKeys.Dot)[0]
            .trim()
          const message = mapErrorCodeToMessage(Number(errorCode))
          yield put(swapActions.setSwapSuccess(false))

          closeSnackbar(loaderSwappingTokens)
          yield put(snackbarsActions.remove(loaderSwappingTokens))

          yield put(
            snackbarsActions.add({
              message,
              variant: 'error',
              persist: false
            })
          )
          return
        }
      }
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid: initialTxid
        })
      )

      const meta = txDetails.meta
      if (meta?.innerInstructions && meta.innerInstructions) {
        try {
          const nativeAmount = (
            meta.innerInstructions[0].instructions.find(
              ix => (ix as ParsedInstruction).parsed.info.amount
            ) as ParsedInstruction
          ).parsed.info.amount

          const splAmount = (
            meta.innerInstructions[0].instructions.find(
              ix => (ix as ParsedInstruction).parsed.info.tokenAmount !== undefined
            ) as ParsedInstruction
          ).parsed.info.tokenAmount.amount

          const tokenIn = isXtoY
            ? allTokens[swapPool.tokenX.toString()]
            : allTokens[swapPool.tokenY.toString()]
          const tokenOut = isXtoY
            ? allTokens[swapPool.tokenY.toString()]
            : allTokens[swapPool.tokenX.toString()]

          const nativeIn = isXtoY
            ? swapPool.tokenX.equals(NATIVE_MINT)
            : swapPool.tokenY.equals(NATIVE_MINT)

          const amountIn = nativeIn ? nativeAmount : splAmount
          const amountOut = nativeIn ? splAmount : nativeAmount

          let points = new BN(0)
          try {
            if (
              leaderboardConfig.swapPairs.some(
                item =>
                  new PublicKey(item.tokenX).equals(swapPool.tokenX) &&
                  new PublicKey(item.tokenY).equals(swapPool.tokenY)
              )
            ) {
              const feed = feeds[tokenFrom.toString()]

              if (feed && feed.price) {
                points = calculatePoints(
                  new BN(amountIn),
                  tokenIn.decimals,
                  swapPool.fee,
                  feed.price,
                  feed.priceDecimals,
                  new BN(leaderboardConfig.pointsPerUsd, 'hex')
                ).muln(Number(leaderboardConfig.swapMultiplier))
              }
            }
          } catch {
            // Sanity check
          }
          yield put(
            snackbarsActions.add({
              tokensDetails: {
                ikonType: 'swap',
                tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
                tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
                tokenXIcon: tokenIn.logoURI,
                tokenYIcon: tokenOut.logoURI,
                tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
                tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
                earnedPoints: points.eqn(0)
                  ? undefined
                  : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
              },
              persist: false
            })
          )
        } catch {
          // Should never be triggered
        }
      }
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid: initialTxid
        })
      )
    }
    // }

    // const unwrapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   unwrapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    yield put(swapActions.setSwapSuccess(true))

    // if (!unwrapTxid.length) {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'Wrapped ETH unwrap failed. Try to unwrap it in your wallet.',
    //       variant: 'warning',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // } else {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'ETH unwrapped successfully.',
    //       variant: 'success',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)
    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(swapActions.setSwapSuccess(false))

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleTwoHopSwapWithETH(): Generator {
  const loaderSwappingTokens = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const tickmaps = yield* select(tickMaps)
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const {
      slippage,
      tokenFrom,
      tokenTo,
      amountIn,
      firstPair,
      secondPair,
      tokenBetween,
      byAmountIn,
      amountOut
    } = yield* select(swap)

    // Should never be triggered
    if (!tokenBetween || !firstPair || !secondPair) {
      return
    }

    const wallet = yield* call(getWallet)
    const tokensAccounts = yield* select(accounts)
    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    let firstPool = allPools.find(
      pool =>
        (tokenFrom.equals(pool.tokenX) &&
          tokenBetween.equals(pool.tokenY) &&
          firstPair.feeTier.fee.eq(pool.fee)) ||
        (tokenFrom.equals(pool.tokenY) &&
          tokenBetween.equals(pool.tokenX) &&
          firstPair.feeTier.fee.eq(pool.fee))
    )

    let secondPool = allPools.find(
      pool =>
        (tokenBetween.equals(pool.tokenX) &&
          tokenTo.equals(pool.tokenY) &&
          secondPair.feeTier.fee.eq(pool.fee)) ||
        (tokenBetween.equals(pool.tokenY) &&
          tokenTo.equals(pool.tokenX) &&
          secondPair.feeTier.fee.eq(pool.fee))
    )

    if (!firstPool) {
      const address = firstPair.getAddress(marketProgram.program.programId)
      const fetched = yield* call([marketProgram, marketProgram.getPool], firstPair)
      firstPool = { ...fetched, address } as PoolWithAddress
    }

    if (!secondPool) {
      const address = secondPair.getAddress(marketProgram.program.programId)
      const fetched = yield* call([marketProgram, marketProgram.getPool], secondPair)
      secondPool = { ...fetched, address } as PoolWithAddress
    }

    yield put(
      snackbarsActions.add({
        message: 'Swapping tokens...',
        variant: 'pending',
        persist: true,
        key: loaderSwappingTokens
      })
    )

    const firstXtoY = tokenFrom.equals(firstPool.tokenX)
    const secondXtoY = tokenBetween.equals(secondPool.tokenX)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)
    const prependendIxs: TransactionInstruction[] = []
    const appendedIxs: TransactionInstruction[] = []

    if (allTokens[tokenFrom.toString()].address.toString() === WRAPPED_ETH_ADDRESS) {
      const { createIx, transferIx, initIx, unwrapIx } = createNativeAtaWithTransferInstructions(
        wrappedEthAccount.publicKey,
        wallet.publicKey,
        net,
        amountIn.toNumber()
      )

      prependendIxs.push(...[createIx, transferIx, initIx])
      appendedIxs.push(unwrapIx)
    } else {
      const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
        wrappedEthAccount.publicKey,
        wallet.publicKey,
        net
      )

      prependendIxs.push(...[createIx, initIx])
      appendedIxs.push(unwrapIx)
    }

    // const initialBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // initialTx.recentBlockhash = initialBlockhash.blockhash
    // initialTx.feePayer = wallet.publicKey

    let fromAddress =
      allTokens[tokenFrom.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[tokenFrom.toString()]
          ? tokensAccounts[tokenFrom.toString()].address
          : null
    if (fromAddress === null) {
      fromAddress = yield* call(createAccount, tokenFrom)
    }
    let toAddress =
      allTokens[tokenTo.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[tokenTo.toString()]
          ? tokensAccounts[tokenTo.toString()].address
          : null
    if (toAddress === null) {
      toAddress = yield* call(createAccount, tokenTo)
    }

    const params: TwoHopSwap = {
      swapHopOne: {
        pair: firstPair,
        xToY: firstXtoY
      },
      swapHopTwo: {
        pair: secondPair,
        xToY: secondXtoY
      },
      owner: wallet.publicKey,
      accountIn: fromAddress,
      accountOut: toAddress,
      amountIn,
      amountOut,
      slippage,
      byAmountIn
    }

    const cache: TwoHopSwapCache = {
      swapHopOne: {
        pool: firstPool,
        tickmap: tickmaps[firstPool.tickmap.toString()],
        tokenXProgram: allTokens[firstPool.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[firstPool.tokenY.toString()].tokenProgram
      },
      swapHopTwo: {
        pool: secondPool,
        tickmap: tickmaps[secondPool.tickmap.toString()],
        tokenXProgram: allTokens[secondPool.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[secondPool.tokenY.toString()].tokenProgram
      }
    }

    const swapTx = yield* call(
      [marketProgram, marketProgram.versionedTwoHopSwapTx],
      params,
      cache,
      // { tickCrosses: TICK_CROSSES_PER_IX },
      // { tickCrosses: TICK_CROSSES_PER_IX },
      undefined,
      undefined,
      prependendIxs,
      appendedIxs
    )

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const serializedMessage = swapTx.message.serialize()
    const signatureUint8 = nacl.sign.detached(serializedMessage, wrappedEthAccount.secretKey)

    swapTx.addSignature(wrappedEthAccount.publicKey, signatureUint8)

    const signedTx = (yield* call([wallet, wallet.signTransaction], swapTx)) as VersionedTransaction

    closeSnackbar(loaderSigningTx)

    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call([connection, connection.sendRawTransaction], signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call([connection, connection.confirmTransaction], txid)

    if (!txid.length) {
      yield put(swapActions.setSwapSuccess(false))

      closeSnackbar(loaderSwappingTokens)
      yield put(snackbarsActions.remove(loaderSwappingTokens))

      return yield put(
        snackbarsActions.add({
          message: 'ETH wrapping failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    }

    // const swapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   swapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    // if (!swapTxid.length) {
    //   yield put(swapActions.setSwapSuccess(false))

    //   return yield put(
    //     snackbarsActions.add({
    //       message:
    //         'Tokens swapping failed. Please unwrap wrapped ETH in your wallet and try again.',
    //       variant: 'error',
    //       persist: false,
    //       txid: swapTxid
    //     })
    //   )
    // } else {

    // }

    const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
      maxSupportedTransactionVersion: 0
    })

    if (txDetails) {
      if (txDetails.meta?.err) {
        if (txDetails.meta.logMessages) {
          const errorLog = txDetails.meta.logMessages.find(log =>
            log.includes(ErrorCodeExtractionKeys.ErrorNumber)
          )
          const errorCode = errorLog
            ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
            .split(ErrorCodeExtractionKeys.Dot)[0]
            .trim()
          const message = mapErrorCodeToMessage(Number(errorCode))
          yield put(swapActions.setSwapSuccess(false))

          closeSnackbar(loaderSwappingTokens)
          yield put(snackbarsActions.remove(loaderSwappingTokens))
          closeSnackbar(loaderSigningTx)
          yield put(snackbarsActions.remove(loaderSigningTx))

          yield put(
            snackbarsActions.add({
              message,
              variant: 'error',
              persist: false
            })
          )
          return
        }
      }
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
      const meta = txDetails.meta
      if (meta?.innerInstructions && meta.innerInstructions) {
        try {
          const nativeAmount = (
            meta.innerInstructions[0].instructions.find(
              ix => (ix as ParsedInstruction).parsed.info.amount
            ) as ParsedInstruction
          ).parsed.info.amount

          const splTranfsers = meta.innerInstructions[0].instructions.filter(
            ix => (ix as ParsedInstruction).parsed.info.tokenAmount !== undefined
          )

          const tokenIn = firstXtoY
            ? allTokens[firstPool.tokenX.toString()]
            : allTokens[firstPool.tokenY.toString()]
          const tokenOut = secondXtoY
            ? allTokens[secondPool.tokenY.toString()]
            : allTokens[secondPool.tokenX.toString()]

          const nativeIn = tokenIn.address.equals(NATIVE_MINT)

          const splAmount = (
            splTranfsers.find(ix =>
              (ix as ParsedInstruction).parsed.info.mint === nativeIn
                ? tokenOut.address.toString()
                : tokenIn.address.toString()
            ) as ParsedInstruction
          ).parsed.info.tokenAmount.amount

          const amountIn = nativeIn ? nativeAmount : splAmount
          const amountOut = nativeIn ? splAmount : nativeAmount

          let points = new BN(0)

          try {
            if (
              leaderboardConfig.swapPairs.some(
                item =>
                  new PublicKey(item.tokenX).equals(firstPool.tokenX) &&
                  new PublicKey(item.tokenY).equals(firstPool.tokenY)
              )
            ) {
              const feed = feeds[tokenFrom.toString()]

              if (feed && feed.price) {
                points = calculatePoints(
                  new BN(amountIn),
                  tokenIn.decimals,
                  firstPool.fee,
                  feed.price,
                  feed.priceDecimals,
                  new BN(leaderboardConfig.pointsPerUsd, 'hex')
                ).muln(Number(leaderboardConfig.swapMultiplier))
              }
            }

            if (
              leaderboardConfig.swapPairs.some(
                item =>
                  new PublicKey(item.tokenX).equals(secondPool.tokenX) &&
                  new PublicKey(item.tokenY).equals(secondPool.tokenY)
              )
            ) {
              const tokenBetween = secondXtoY
                ? allTokens[secondPool.tokenX.toString()]
                : allTokens[secondPool.tokenY.toString()]

              const feed = feeds[tokenBetween.address.toString()]

              const amountBetween = (
                splTranfsers.find(
                  ix =>
                    (ix as ParsedInstruction).parsed.info.mint === tokenBetween.address.toString()
                ) as ParsedInstruction
              ).parsed.info.tokenAmount.amount

              if (feed && feed.price) {
                points = points.add(
                  calculatePoints(
                    new BN(amountBetween),
                    tokenBetween.decimals,
                    secondPool.fee,
                    feed.price,
                    feed.priceDecimals,
                    new BN(leaderboardConfig.pointsPerUsd, 'hex')
                  ).muln(Number(leaderboardConfig.swapMultiplier))
                )
              }
            }
          } catch {
            // Should never be triggered
          }

          yield put(
            snackbarsActions.add({
              tokensDetails: {
                ikonType: 'swap',
                tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
                tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
                tokenXIcon: tokenIn.logoURI,
                tokenYIcon: tokenOut.logoURI,
                tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
                tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
                earnedPoints: points.eqn(0)
                  ? undefined
                  : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
              },
              persist: false
            })
          )
        } catch {
          // Should never be triggered
        }
      }
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    // const unwrapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   unwrapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    yield put(swapActions.setSwapSuccess(true))

    // if (!unwrapTxid.length) {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'Wrapped ETH unwrap failed. Try to unwrap it in your wallet.',
    //       variant: 'warning',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // } else {
    //   yield put(
    //     snackbarsActions.add({
    //       message: 'ETH unwrapped successfully.',
    //       variant: 'success',
    //       persist: false,
    //       txid: unwrapTxid
    //     })
    //   )
    // }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)

    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(swapActions.setSwapSuccess(false))

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleTwoHopSwap(): Generator {
  const loaderSwappingTokens = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  const tickmaps = yield* select(tickMaps)

  try {
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const {
      slippage,
      tokenFrom,
      tokenTo,
      amountIn,
      firstPair,
      secondPair,
      tokenBetween,
      byAmountIn,
      amountOut
    } = yield* select(swap)

    // No need to use wrapped ETH when it is intermediate token
    if (
      tokenFrom.toString() === WRAPPED_ETH_ADDRESS ||
      tokenTo.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleTwoHopSwapWithETH)
    }

    // Should never be triggered
    if (!tokenBetween || !firstPair || !secondPair) {
      return
    }

    const wallet = yield* call(getWallet)
    const tokensAccounts = yield* select(accounts)
    const networkType = yield* select(network)
    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    let firstPool = allPools.find(
      pool =>
        (tokenFrom.equals(pool.tokenX) &&
          tokenBetween.equals(pool.tokenY) &&
          firstPair.feeTier.fee.eq(pool.fee)) ||
        (tokenFrom.equals(pool.tokenY) &&
          tokenBetween.equals(pool.tokenX) &&
          firstPair.feeTier.fee.eq(pool.fee))
    )

    let secondPool = allPools.find(
      pool =>
        (tokenBetween.equals(pool.tokenX) &&
          tokenTo.equals(pool.tokenY) &&
          secondPair.feeTier.fee.eq(pool.fee)) ||
        (tokenBetween.equals(pool.tokenY) &&
          tokenTo.equals(pool.tokenX) &&
          secondPair.feeTier.fee.eq(pool.fee))
    )

    if (!firstPool) {
      const address = firstPair.getAddress(marketProgram.program.programId)
      const fetched = yield* call([marketProgram, marketProgram.getPool], firstPair)
      firstPool = { ...fetched, address } as PoolWithAddress
    }

    if (!secondPool) {
      const address = secondPair.getAddress(marketProgram.program.programId)
      const fetched = yield* call([marketProgram, marketProgram.getPool], secondPair)
      secondPool = { ...fetched, address } as PoolWithAddress
    }

    yield put(
      snackbarsActions.add({
        message: 'Swapping tokens...',
        variant: 'pending',
        persist: true,
        key: loaderSwappingTokens
      })
    )

    const firstXtoY = tokenFrom.equals(firstPool.tokenX)
    const secondXtoY = tokenBetween.equals(secondPool.tokenX)

    let fromAddress = tokensAccounts[tokenFrom.toString()]
      ? tokensAccounts[tokenFrom.toString()].address
      : null
    if (fromAddress === null) {
      fromAddress = yield* call(createAccount, tokenFrom)
    }
    let toAddress = tokensAccounts[tokenTo.toString()]
      ? tokensAccounts[tokenTo.toString()].address
      : null
    if (toAddress === null) {
      toAddress = yield* call(createAccount, tokenTo)
    }

    const params: TwoHopSwap = {
      swapHopOne: {
        pair: firstPair,
        xToY: firstXtoY
      },
      swapHopTwo: {
        pair: secondPair,
        xToY: secondXtoY
      },
      owner: wallet.publicKey,
      accountIn: fromAddress,
      accountOut: toAddress,
      amountIn,
      amountOut,
      slippage,
      byAmountIn
    }

    const cache: TwoHopSwapCache = {
      swapHopOne: {
        pool: firstPool,
        tickmap: tickmaps[firstPool.tickmap.toString()],
        tokenXProgram: allTokens[firstPool.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[firstPool.tokenY.toString()].tokenProgram
      },
      swapHopTwo: {
        pool: secondPool,
        tickmap: tickmaps[secondPool.tickmap.toString()],
        tokenXProgram: allTokens[secondPool.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[secondPool.tokenY.toString()].tokenProgram
      }
    }

    const prependendIxs = []
    const appendedIxs = []

    const swapTx = yield* call(
      [marketProgram, marketProgram.versionedTwoHopSwapTx],
      params,
      cache,
      // { tickCrosses: TICK_CROSSES_PER_IX },
      // { tickCrosses: TICK_CROSSES_PER_IX },
      undefined,
      undefined,
      prependendIxs,
      appendedIxs
    )

    const connection = yield* call(getConnection)

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], swapTx)) as VersionedTransaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call([connection, connection.sendRawTransaction], signedTx.serialize(), {
      skipPreflight: false
    })

    yield* call([connection, connection.confirmTransaction], txid)

    yield put(swapActions.setSwapSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapping failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
        maxSupportedTransactionVersion: 0
      })

      if (txDetails) {
        if (txDetails.meta?.err) {
          if (txDetails.meta.logMessages) {
            const errorLog = txDetails.meta.logMessages.find(log =>
              log.includes(ErrorCodeExtractionKeys.ErrorNumber)
            )
            const errorCode = errorLog
              ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
              .split(ErrorCodeExtractionKeys.Dot)[0]
              .trim()
            const message = mapErrorCodeToMessage(Number(errorCode))
            yield put(swapActions.setSwapSuccess(false))

            closeSnackbar(loaderSwappingTokens)
            yield put(snackbarsActions.remove(loaderSwappingTokens))
            closeSnackbar(loaderSigningTx)
            yield put(snackbarsActions.remove(loaderSigningTx))

            yield put(
              snackbarsActions.add({
                message,
                variant: 'error',
                persist: false
              })
            )
            return
          }
        }

        yield put(
          snackbarsActions.add({
            message: 'Tokens swapped successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta
        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountInPredicate = entry =>
            entry.mint === firstXtoY
              ? firstPool.tokenX.toString()
              : firstPool.tokenY.toString() && entry.owner === wallet.publicKey.toString()
          const accountBetweenPredicate = entry =>
            entry.mint === firstXtoY
              ? firstPool.tokenY.toString()
              : firstPool.tokenX.toString() &&
                entry.owner === marketProgram.programAuthority.address.toString()
          const accountOutPredicate = entry =>
            entry.mint === secondXtoY
              ? secondPool.tokenY.toString()
              : secondPool.tokenX.toString() && entry.owner === wallet.publicKey.toString()

          const preAccoutnIn = meta.preTokenBalances.find(accountInPredicate)
          const postAccountIn = meta.postTokenBalances.find(accountInPredicate)
          const preAccountBetween = meta.preTokenBalances.find(accountBetweenPredicate)
          const postAccountBetween = meta.postTokenBalances.find(accountBetweenPredicate)
          const preAccountOut = meta.preTokenBalances.find(accountOutPredicate)
          const postAccountOut = meta.postTokenBalances.find(accountOutPredicate)

          if (preAccoutnIn && postAccountIn && preAccountOut && postAccountOut) {
            const preAmountIn = preAccoutnIn.uiTokenAmount.amount
            const preAmountOut = preAccountOut.uiTokenAmount.amount

            const postAmountIn = postAccountIn.uiTokenAmount.amount
            const postAmountOut = postAccountOut.uiTokenAmount.amount

            const amountIn = new BN(preAmountIn).sub(new BN(postAmountIn))

            const amountOut = new BN(preAmountOut).sub(new BN(postAmountOut))

            try {
              const tokenIn =
                allTokens[firstXtoY ? firstPool.tokenX.toString() : firstPool.tokenY.toString()]

              const tokenOut =
                allTokens[secondXtoY ? secondPool.tokenY.toString() : secondPool.tokenX.toString()]

              let points = new BN(0)
              try {
                if (preAccountBetween && postAccountBetween) {
                  const betweenAmountPre = new BN(preAccountBetween.uiTokenAmount.amount)
                  const betweenAmountPost = new BN(postAccountBetween.uiTokenAmount.amount)

                  const amountBetween = betweenAmountPost.gt(betweenAmountPre)
                    ? betweenAmountPost.sub(betweenAmountPre)
                    : betweenAmountPre.sub(betweenAmountPost)

                  const tokenBetween =
                    allTokens[
                      secondXtoY ? firstPool.tokenX.toString() : firstPool.tokenY.toString()
                    ]

                  if (
                    leaderboardConfig.swapPairs.some(
                      item =>
                        new PublicKey(item.tokenX).equals(firstPool.tokenX) &&
                        new PublicKey(item.tokenY).equals(firstPool.tokenY)
                    )
                  ) {
                    const feed = feeds[tokenFrom.toString()]

                    if (feed && feed.price) {
                      points = calculatePoints(
                        amountIn,
                        tokenIn.decimals,
                        firstPool.fee,
                        feed.price,
                        feed.priceDecimals,
                        new BN(leaderboardConfig.pointsPerUsd, 'hex')
                      ).muln(Number(leaderboardConfig.swapMultiplier))
                    }
                  }

                  if (
                    leaderboardConfig.swapPairs.some(
                      item =>
                        new PublicKey(item.tokenX).equals(secondPool.tokenX) &&
                        new PublicKey(item.tokenY).equals(secondPool.tokenY)
                    )
                  ) {
                    const feed = feeds[tokenBetween.toString()]

                    if (feed && feed.price) {
                      points = points.add(
                        calculatePoints(
                          amountBetween,
                          tokenBetween.decimals,
                          secondPool.fee,
                          feed.price,
                          feed.priceDecimals,
                          new BN(leaderboardConfig.pointsPerUsd, 'hex')
                        ).muln(Number(leaderboardConfig.swapMultiplier))
                      )
                    }
                  }
                }
              } catch {
                // Should never be triggered
              }

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'swap',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
                    tokenXIcon: tokenIn.logoURI,
                    tokenYIcon: tokenOut.logoURI,
                    tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
                    tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
                    earnedPoints: points.eqn(0)
                      ? undefined
                      : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
                  },
                  persist: false
                })
              )
            } catch {
              // Sanity wrapper, should never be triggered
            }
          }
        }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'Tokens swapped successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)
    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(swapActions.setSwapSuccess(false))

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleSwap(): Generator {
  const loaderSwappingTokens = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  const tickmaps = yield* select(tickMaps)

  try {
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const {
      slippage,
      tokenFrom,
      tokenTo,
      amountIn,
      firstPair,
      estimatedPriceAfterSwap,
      tokenBetween,
      byAmountIn,
      amountOut
    } = yield* select(swap)

    if (tokenBetween) {
      return yield* call(handleTwoHopSwap)
    }

    if (
      tokenFrom.toString() === WRAPPED_ETH_ADDRESS ||
      tokenTo.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleSwapWithETH)
    }

    // Should never be trigerred
    if (!firstPair) {
      return
    }

    const wallet = yield* call(getWallet)
    const tokensAccounts = yield* select(accounts)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const connection = yield* call(getConnection)

    const swapPool = allPools.find(
      pool =>
        (tokenFrom.equals(pool.tokenX) &&
          tokenTo.equals(pool.tokenY) &&
          firstPair?.feeTier.fee.eq(pool.fee)) ||
        (tokenFrom.equals(pool.tokenY) &&
          tokenTo.equals(pool.tokenX) &&
          firstPair?.feeTier.fee.eq(pool.fee))
    )

    if (!swapPool) {
      return
    }

    yield put(
      snackbarsActions.add({
        message: 'Swapping tokens...',
        variant: 'pending',
        persist: true,
        key: loaderSwappingTokens
      })
    )

    const isXtoY = tokenFrom.equals(swapPool.tokenX)

    let fromAddress = tokensAccounts[tokenFrom.toString()]
      ? tokensAccounts[tokenFrom.toString()].address
      : null
    if (fromAddress === null) {
      fromAddress = yield* call(createAccount, tokenFrom)
    }
    let toAddress = tokensAccounts[tokenTo.toString()]
      ? tokensAccounts[tokenTo.toString()].address
      : null
    if (toAddress === null) {
      toAddress = yield* call(createAccount, tokenTo)
    }

    const swapPair = new Pair(tokenFrom, tokenTo, {
      fee: swapPool.fee,
      tickSpacing: swapPool.tickSpacing
    })

    const tickIndexes = marketProgram.findTickIndexesForSwap(
      swapPool,
      tickmaps[swapPool.tickmap.toString()],
      isXtoY,
      MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS
    )

    const luts = getLookupTableAddresses(
      marketProgram,
      new Pair(tokenFrom, tokenTo, {
        fee: swapPool.fee,
        tickSpacing: swapPool.tickSpacing
      }),
      tickIndexes
    )

    let txid: string

    if (luts.length !== 0) {
      const swapTx = yield* call(
        [marketProgram, marketProgram.versionedSwapTx],
        {
          pair: swapPair,
          xToY: isXtoY,
          amount: byAmountIn ? amountIn : amountOut,
          estimatedPriceAfterSwap,
          slippage: slippage,
          accountX: isXtoY ? fromAddress : toAddress,
          accountY: isXtoY ? toAddress : fromAddress,
          byAmountIn: byAmountIn,
          owner: wallet.publicKey
        },
        {
          pool: swapPool,
          tickmap: tickmaps[swapPool.tickmap.toString()],
          tokenXProgram: allTokens[swapPool.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[swapPool.tokenY.toString()].tokenProgram
        },
        { tickIndexes },
        [],
        [],
        luts
      )

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      const initialSignedTx = (yield* call(
        [wallet, wallet.signTransaction],
        swapTx
      )) as VersionedTransaction

      closeSnackbar(loaderSigningTx)
      yield put(snackbarsActions.remove(loaderSigningTx))

      txid = yield* call([connection, connection.sendRawTransaction], initialSignedTx.serialize(), {
        skipPreflight: false
      })

      yield* call([connection, connection.confirmTransaction], txid)
    } else {
      const setCuIx = computeUnitsInstruction(1_400_000, wallet.publicKey)
      const swapIx = yield* call(
        [marketProgram, marketProgram.swapIx],
        {
          pair: swapPair,
          xToY: isXtoY,
          amount: byAmountIn ? amountIn : amountOut,
          estimatedPriceAfterSwap,
          slippage: slippage,
          accountX: isXtoY ? fromAddress : toAddress,
          accountY: isXtoY ? toAddress : fromAddress,
          byAmountIn: byAmountIn,
          owner: wallet.publicKey
        },
        {
          pool: swapPool,
          tickmap: tickmaps[swapPool.tickmap.toString()],
          tokenXProgram: allTokens[swapPool.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[swapPool.tokenY.toString()].tokenProgram
        },
        { tickCrosses: MAX_CROSSES_IN_SINGLE_TX }
      )
      const tx = new Transaction().add(setCuIx).add(swapIx)

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

      const { blockhash, lastValidBlockHeight } = yield* call([
        connection,
        connection.getLatestBlockhash
      ])
      tx.recentBlockhash = blockhash
      tx.lastValidBlockHeight = lastValidBlockHeight
      tx.feePayer = wallet.publicKey

      const initialSignedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

      closeSnackbar(loaderSigningTx)
      yield put(snackbarsActions.remove(loaderSigningTx))

      txid = yield* call(sendAndConfirmRawTransaction, connection, initialSignedTx.serialize(), {
        skipPreflight: false
      })
    }

    yield put(swapActions.setSwapSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapping failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      const txDetails = yield* call([connection, connection.getParsedTransaction], txid, {
        maxSupportedTransactionVersion: 0
      })

      if (txDetails) {
        if (txDetails.meta?.err) {
          if (txDetails.meta.logMessages) {
            const errorLog = txDetails.meta.logMessages.find(log =>
              log.includes(ErrorCodeExtractionKeys.ErrorNumber)
            )
            const errorCode = errorLog
              ?.split(ErrorCodeExtractionKeys.ErrorNumber)[1]
              .split(ErrorCodeExtractionKeys.Dot)[0]
              .trim()
            const message = mapErrorCodeToMessage(Number(errorCode))
            yield put(swapActions.setSwapSuccess(false))

            closeSnackbar(loaderSwappingTokens)
            yield put(snackbarsActions.remove(loaderSwappingTokens))
            closeSnackbar(loaderSigningTx)
            yield put(snackbarsActions.remove(loaderSigningTx))

            yield put(
              snackbarsActions.add({
                message,
                variant: 'error',
                persist: false
              })
            )
            return
          }
        }

        yield put(
          snackbarsActions.add({
            message: 'Tokens swapped successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta
        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === swapPool.tokenX.toString() && entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === swapPool.tokenY.toString() && entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount
            const { amountIn, amountOut } = isXtoY
              ? {
                  amountIn: new BN(preAmountX).sub(new BN(postAmountX)),
                  amountOut: new BN(postAmountY).sub(new BN(preAmountY))
                }
              : {
                  amountIn: new BN(preAmountY).sub(new BN(postAmountY)),
                  amountOut: new BN(postAmountX).sub(new BN(preAmountX))
                }

            try {
              const tokenIn =
                allTokens[isXtoY ? swapPool.tokenX.toString() : swapPool.tokenY.toString()]
              const tokenOut =
                allTokens[isXtoY ? swapPool.tokenY.toString() : swapPool.tokenX.toString()]

              let points = new BN(0)
              try {
                if (
                  leaderboardConfig.swapPairs.some(
                    item =>
                      new PublicKey(item.tokenX).equals(swapPool.tokenX) &&
                      new PublicKey(item.tokenY).equals(swapPool.tokenY)
                  )
                ) {
                  const feed = feeds[tokenFrom.toString()]

                  if (feed && feed.price) {
                    points = calculatePoints(
                      amountIn,
                      tokenIn.decimals,
                      swapPool.fee,
                      feed.price,
                      feed.priceDecimals,
                      new BN(leaderboardConfig.pointsPerUsd, 'hex')
                    ).muln(Number(leaderboardConfig.swapMultiplier))
                  }
                }
              } catch {
                // Sanity check in case some leaderboard config is missing
              }

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'swap',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
                    tokenXIcon: tokenIn.logoURI,
                    tokenYIcon: tokenOut.logoURI,
                    tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
                    tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
                    earnedPoints: points.eqn(0)
                      ? undefined
                      : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
                  },
                  persist: false
                })
              )
            } catch {
              // Sanity wrapper, should never be triggered
            }
          }
        }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'Tokens swapped successfully',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    let msg: string = ''
    if (error instanceof SendTransactionError) {
      const err = error.transactionError
      try {
        const errorCode = extractRuntimeErrorCode(err)
        msg = mapErrorCodeToMessage(errorCode)
      } catch {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      }
    } else {
      try {
        const errorCode = extractErrorCode(error)
        msg = mapErrorCodeToMessage(errorCode)
      } catch (e: unknown) {
        const error = ensureError(e)
        msg = ensureApprovalDenied(error) ? APPROVAL_DENIED_MESSAGE : COMMON_ERROR_MESSAGE
      }
    }

    yield put(swapActions.setSwapSuccess(false))

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    if (error instanceof TransactionExpiredTimeoutError) {
      yield put(
        snackbarsActions.add({
          message: TIMEOUT_ERROR_MESSAGE,
          variant: 'info',
          persist: true,
          txid: error.signature
        })
      )
      yield put(connectionActions.setTimeoutError(true))
      yield put(RPCAction.setRpcStatus(RpcStatus.Error))
    } else {
      yield put(
        snackbarsActions.add({
          message: msg,
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetTwoHopSwapData(
  action: PayloadAction<{ tokenFrom: PublicKey; tokenTo: PublicKey }>
): Generator {
  const { tokenFrom, tokenTo } = action.payload

  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const market = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

  const { whitelistTickmaps, poolSet, routeCandidates } = routingEssentials(
    tokenFrom,
    tokenTo,
    market.program.programId,
    market.network
  )

  const accounts = yield* call([market, market.fetchAccounts], {
    pools: Array.from(poolSet).map(pool => new PublicKey(pool)),
    tickmaps: whitelistTickmaps
  })

  for (const pool of poolSet) {
    if (!accounts.pools[pool]) {
      poolSet.delete(pool)
    }
  }

  for (let i = routeCandidates.length - 1; i >= 0; i--) {
    const [pairIn, pairOut] = routeCandidates[i]

    if (
      !accounts.pools[pairIn.getAddress(market.program.programId).toBase58()] ||
      !accounts.pools[pairOut.getAddress(market.program.programId).toBase58()]
    ) {
      const lastCandidate = routeCandidates.pop()!
      if (i !== routeCandidates.length) {
        routeCandidates[i] = lastCandidate
      }
    }
  }

  const accountsTickmaps = yield* call([market, market.fetchAccounts], {
    tickmaps: Array.from(poolSet)
      .filter(pool => !accounts.tickmaps[pool])
      .map(pool => accounts.pools[pool].tickmap)
  })
  accounts.tickmaps = { ...accounts.tickmaps, ...accountsTickmaps.tickmaps }

  const crossLimit =
    tokenFrom.toString() === WRAPPED_ETH_ADDRESS || tokenTo.toString() === WRAPPED_ETH_ADDRESS
      ? MAX_CROSSES_IN_SINGLE_TX
      : TICK_CROSSES_PER_IX
  const accountsTicks = yield* call([market, market.fetchAccounts], {
    ticks: market.gatherTwoHopTickAddresses(poolSet, tokenFrom, tokenTo, accounts, crossLimit)
  })
  accounts.ticks = { ...accounts.ticks, ...accountsTicks.ticks }

  yield put(swapActions.setTwoHopSwapData({ accounts }))
}

export function* swapHandler(): Generator {
  yield* takeEvery(swapActions.swap, handleSwap)
}

export function* getTwoHopSwapDataHandler(): Generator {
  yield* takeLatest(swapActions.getTwoHopSwapData, handleGetTwoHopSwapData)
}

export function* swapSaga(): Generator {
  yield* all([swapHandler, getTwoHopSwapDataHandler].map(spawn))
}
