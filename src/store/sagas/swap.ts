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
  Transaction,
  TransactionExpiredTimeoutError,
  TransactionInstruction,
  VersionedTransaction
} from '@solana/web3.js'
import {
  MAX_CROSSES_IN_SINGLE_TX,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { closeSnackbar } from 'notistack'
import { createLoaderKey, ensureError, getAgregatorSwapRoutesData, printBN } from '@utils/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import {
  createNativeAtaInstructions,
  createNativeAtaWithTransferInstructions
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
    let initialTx: Transaction
    let unwrapIx: TransactionInstruction
    if (allTokens[tokenFrom.toString()].address.toString() === WRAPPED_ETH_ADDRESS) {
      const {
        createIx,
        transferIx,
        initIx,
        unwrapIx: unwrap
      } = createNativeAtaWithTransferInstructions(
        wrappedEthAccount.publicKey,
        wallet.publicKey,
        net,
        amountIn.toNumber()
      )
      unwrapIx = unwrap
      initialTx = new Transaction().add(createIx).add(transferIx).add(initIx)
    } else {
      const {
        createIx,
        initIx,
        unwrapIx: unwrap
      } = createNativeAtaInstructions(wrappedEthAccount.publicKey, wallet.publicKey, net)
      unwrapIx = unwrap
      initialTx = new Transaction().add(createIx).add(initIx)
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

    const swapIx = yield* call(
      [marketProgram, marketProgram.swapIx],
      {
        pair: new Pair(tokenFrom, tokenTo, {
          fee: swapPool.fee,
          tickSpacing: swapPool.tickSpacing
        }),
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
        tickmap: tickmaps[swapPool.tickmap.toString()]
      },
      { tickCrosses: MAX_CROSSES_IN_SINGLE_TX }
    )

    initialTx.add(swapIx)
    initialTx.add(unwrapIx)

    // const swapBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // swapTx.recentBlockhash = swapBlockhash.blockhash
    // swapTx.feePayer = wallet.publicKey

    // const unwrapTx = new Transaction().add(unwrapIx)
    // const unwrapBlockhash = yield* call([connection, connection.getRecentBlockhash])
    // unwrapTx.recentBlockhash = unwrapBlockhash.blockhash
    // unwrapTx.feePayer = wallet.publicKey

    const initialBlockhash = yield* call([connection, connection.getLatestBlockhash])
    initialTx.recentBlockhash = initialBlockhash.blockhash
    initialTx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const initialSignedTx = (yield* call(
      [wallet, wallet.signTransaction],
      initialTx
    )) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    initialSignedTx.partialSign(wrappedEthAccount)

    const initialTxid = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      initialSignedTx.serialize(),
      {
        skipPreflight: false
      }
    )

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
    yield put(
      snackbarsActions.add({
        message: 'Tokens swapped successfully',
        variant: 'success',
        persist: false,
        txid: initialTxid
      })
    )
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
    console.log(error)

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
          message: 'Failed to send. Please try again',
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
    yield put(
      snackbarsActions.add({
        message: 'Tokens swapped successfully',
        variant: 'success',
        persist: false,
        txid
      })
    )
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
    console.log(error)

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
          message: 'Failed to send. Please try again',
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

    // if (!firstPool || !secondPool) {
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
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

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
          message: 'Failed to send. Please try again',
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
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
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

    const swapTx = yield* call(
      [marketProgram, marketProgram.swapTx],
      {
        pair: new Pair(tokenFrom, tokenTo, {
          fee: swapPool.fee,
          tickSpacing: swapPool.tickSpacing
        }),
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
      }
    )
    const connection = yield* call(getConnection)
    const blockhash = yield* call([connection, connection.getLatestBlockhash])
    swapTx.recentBlockhash = blockhash.blockhash
    swapTx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], swapTx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

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
      yield put(
        snackbarsActions.add({
          message: 'Tokens swapped successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )
    }

    closeSnackbar(loaderSwappingTokens)
    yield put(snackbarsActions.remove(loaderSwappingTokens))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

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
          message: 'Failed to send. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }

    yield* call(handleRpcError, error.message)
  }
}

export function* handleFetchSwapRoute(
  action: PayloadAction<{ amountIn: BN; slippage: number }>
): Generator {
  try {
    const swapState = yield* select(swap)
    const { tokenFrom, tokenTo } = swapState
    const { amountIn, slippage } = action.payload

    if (
      tokenFrom.equals(PublicKey.default) ||
      tokenTo.equals(PublicKey.default) ||
      amountIn.eq(new BN(0))
    ) {
      return
    }

    console.log(amountIn)

    yield put(swapActions.setSwapRouteLoading(true))

    const slippageBps = slippage * 100

    const routesData = yield* call(getAgregatorSwapRoutesData, {
      inputMint: tokenFrom,
      outputMint: tokenTo,
      slippageBps,
      amountIn
    })

    if (routesData) {
      const { ...data } = routesData
      yield put(
        swapActions.setSwapRouteResponse({
          ...data
        })
      )
    } else {
      console.error('Failed to fetch swap routes')
    }
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log('Error fetching swap routes:', error)
  } finally {
    yield put(swapActions.setSwapRouteLoading(false))
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

export function* fetchSwapRouteHandler(): Generator {
  yield* takeEvery(swapActions.fetchSwapRoute, handleFetchSwapRoute)
}

export function* swapSaga(): Generator {
  yield* all([swapHandler, getTwoHopSwapDataHandler, fetchSwapRouteHandler].map(spawn))
}
