import { call, put, takeEvery, take, select, all, spawn, takeLatest } from 'typed-redux-saga'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as poolsActions, ListPoolsResponse, ListType } from '@store/reducers/pools'
import { createAccount, getWallet } from './wallet'
import { getConnection, handleRpcError } from './connection'
import {
  actions,
  ClosePositionData,
  GetCurrentTicksData,
  InitPositionData,
  PositionWithAddress,
  SwapAndCreatePosition
} from '@store/reducers/positions'
import { PayloadAction } from '@reduxjs/toolkit'
import { poolsArraySortedByFees, tokens } from '@store/selectors/pools'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { accounts } from '@store/selectors/solanaWallet'
import { actions as RPCAction, RpcStatus } from '@store/reducers/solanaConnection'
import {
  Transaction,
  sendAndConfirmRawTransaction,
  Keypair,
  TransactionExpiredTimeoutError,
  VersionedTransaction,
  PublicKey,
  ParsedInstruction,
  SendTransactionError
} from '@solana/web3.js'
import {
  APPROVAL_DENIED_MESSAGE,
  autoSwapPools,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  LEADERBOARD_DECIMAL,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  plotTicks,
  lockedPositionsWithPoolsData,
  positionsList,
  positionsWithPoolsData
} from '@store/selectors/positions'
import { GuardPredicate } from '@redux-saga/types'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { closeSnackbar } from 'notistack'
import { getLockerProgram, getMarketProgram } from '@utils/web3/programs/amm'
import {
  calculatePoints,
  createLiquidityPlot,
  createLoaderKey,
  createPlaceholderLiquidityPlot,
  ensureApprovalDenied,
  ensureError,
  extractErrorCode,
  extractRuntimeErrorCode,
  formatNumberWithoutSuffix,
  getLiquidityTicksByPositionsList,
  getPositionByIdAndPoolAddress,
  getPositionsAddressesFromRange,
  getTicksFromAddresses,
  mapErrorCodeToMessage,
  printBN
} from '@utils/utils'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import {
  calculateClaimAmount,
  createNativeAtaInstructions,
  createNativeAtaWithTransferInstructions,
  FEE_TIERS
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { ClaimAllFee } from '@invariant-labs/sdk-eclipse/lib/market'
import nacl from 'tweetnacl'
import { BN } from '@coral-xyz/anchor'
import { parseTick, Position } from '@invariant-labs/sdk-eclipse/lib/market'
import { NATIVE_MINT } from '@solana/spl-token'
import { unknownTokenIcon } from '@static/icons'
import { config, priceFeeds } from '@store/selectors/leaderboard'
function* handleInitPositionAndPoolWithETH(action: PayloadAction<InitPositionData>): Generator {
  const data = action.payload

  if (
    (data.tokenX.toString() === WRAPPED_ETH_ADDRESS && data.xAmount === 0) ||
    (data.tokenY.toString() === WRAPPED_ETH_ADDRESS && data.yAmount === 0)
  ) {
    return yield* call(handleInitPosition, action)
  }

  const loaderCreatePool = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    yield put(
      snackbarsActions.add({
        message: 'Creating pool...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePool
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet(wallet as IWallet)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()
    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, transferIx, unwrapIx } = createNativeAtaWithTransferInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net,
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? data.xAmount
        : data.yAmount
    )

    let userTokenX =
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenX.toString()]
          ? tokensAccounts[data.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, data.tokenX)
    }

    let userTokenY =
      allTokens[data.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenY.toString()]
          ? tokensAccounts[data.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, data.tokenY)
    }

    const combinedTransaction = new Transaction()
    const pair = new Pair(data.tokenX, data.tokenY, {
      fee: data.fee,
      tickSpacing: data.tickSpacing
    })

    const { createPoolTx, createPoolSigners, createPositionTx } = yield* call(
      [marketProgram, marketProgram.createPoolWithSqrtPriceAndPositionTx],
      {
        pair,
        userTokenX,
        userTokenY,
        lowerTick: data.lowerTick,
        upperTick: data.upperTick,
        liquidityDelta: data.liquidityDelta,
        owner: wallet.publicKey,
        initTick: data.initTick,
        slippage: data.slippage,
        knownPrice: data.knownPrice
      },
      undefined,
      {
        tokenXProgramAddress: allTokens[data.tokenX.toString()].tokenProgram,
        tokenYProgramAddress: allTokens[data.tokenY.toString()].tokenProgram
      }
    )

    combinedTransaction
      .add(createIx)
      .add(transferIx)
      .add(initIx)
      .add(createPositionTx)
      .add(unwrapIx)

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const { blockhash: createPoolBlockhash, lastValidBlockHeight: createPoolLastValidBlockheight } =
      yield* call([connection, connection.getLatestBlockhash])

    createPoolTx.recentBlockhash = createPoolBlockhash
    createPoolTx.lastValidBlockHeight = createPoolLastValidBlockheight
    createPoolTx.feePayer = wallet.publicKey
    if (createPoolSigners.length) {
      createPoolTx.partialSign(...createPoolSigners)
    }

    const createPoolSignedTx = (yield* call(
      [wallet, wallet.signTransaction],
      createPoolTx
    )) as Transaction

    yield* call(sendAndConfirmRawTransaction, connection, createPoolSignedTx.serialize(), {
      skipPreflight: false
    })

    const {
      blockhash: createPositionBlockhash,
      lastValidBlockHeight: createPositionLastValidBlockheight
    } = yield* call([connection, connection.getLatestBlockhash])

    combinedTransaction.recentBlockhash = createPositionBlockhash
    combinedTransaction.lastValidBlockHeight = createPositionLastValidBlockheight
    combinedTransaction.feePayer = wallet.publicKey
    combinedTransaction.partialSign(wrappedEthAccount)

    const signedCombinedTransactionTx = (yield* call(
      [wallet, wallet.signTransaction],
      combinedTransaction
    )) as Transaction

    const createPositionTxid = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      signedCombinedTransactionTx.serialize(),
      {
        skipPreflight: false
      }
    )

    if (!createPositionTxid.length) {
      yield put(actions.setInitPositionSuccess(false))

      closeSnackbar(loaderCreatePool)
      yield put(snackbarsActions.remove(loaderCreatePool))

      return yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid: createPositionTxid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid: createPositionTxid
        })
      )

      const txDetails = yield* call(
        [connection, connection.getParsedTransaction],
        createPositionTxid
      )

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
            yield put(actions.setInitPositionSuccess(false))

            closeSnackbar(loaderCreatePool)
            yield put(snackbarsActions.remove(loaderCreatePool))
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

            const tokenX = allTokens[pair.tokenX.toString()]
            const tokenY = allTokens[pair.tokenY.toString()]

            const nativeX = pair.tokenX.equals(NATIVE_MINT)

            const amountX = nativeX ? nativeAmount : splAmount
            const amountY = nativeX ? splAmount : nativeAmount

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'deposit',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                },
                persist: false
              })
            )
          } catch {
            // Should never be triggered
          }
        }
      }

      yield put(actions.getPositionsList())
    }

    // const unwrapTxid = yield* call(
    //   sendAndConfirmRawTransaction,
    //   connection,
    //   unwrapSignedTx.serialize(),
    //   {
    //     skipPreflight: false
    //   }
    // )

    yield put(actions.setInitPositionSuccess(true))

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

    closeSnackbar(loaderCreatePool)
    yield put(snackbarsActions.remove(loaderCreatePool))
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

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePool)
    yield put(snackbarsActions.remove(loaderCreatePool))
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

function* handleInitPositionWithETH(action: PayloadAction<InitPositionData>): Generator {
  const data = action.payload

  if (
    (data.tokenX.toString() === WRAPPED_ETH_ADDRESS && data.xAmount === 0) ||
    (data.tokenY.toString() === WRAPPED_ETH_ADDRESS && data.yAmount === 0)
  ) {
    return yield* call(handleInitPosition, action)
  }

  // To initialize both the pool and position, separate transactions are necessary, as a single transaction does not have enough space to accommodate all instructions for both pool and position creation with ETH.
  if (data.initPool) {
    return yield* call(handleInitPositionAndPoolWithETH, action)
  }

  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    yield put(
      snackbarsActions.add({
        message: 'Creating position...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)
    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)

    const pair = new Pair(data.tokenX, data.tokenY, {
      fee: data.fee,
      tickSpacing: data.tickSpacing
    })
    const userPositionList = yield* select(positionsList)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, transferIx, unwrapIx } = createNativeAtaWithTransferInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net,
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? data.xAmount
        : data.yAmount
    )

    let userTokenX =
      allTokens[data.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenX.toString()]
          ? tokensAccounts[data.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, data.tokenX)
    }

    let userTokenY =
      allTokens[data.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[data.tokenY.toString()]
          ? tokensAccounts[data.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, data.tokenY)
    }

    const poolSigners: Keypair[] = []

    const combinedTransaction = new Transaction()

    combinedTransaction.add(createIx).add(transferIx).add(initIx)

    const upperTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === data.upperTick) !== undefined
        ? true
        : undefined
    const lowerTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === data.lowerTick) !== undefined
        ? true
        : undefined

    const initPositionTx = yield* call(
      [marketProgram, marketProgram.createPositionTx],
      {
        pair,
        userTokenX,
        userTokenY,
        lowerTick: data.lowerTick,
        upperTick: data.upperTick,
        liquidityDelta: data.liquidityDelta,
        owner: wallet.publicKey,
        slippage: data.slippage,
        knownPrice: data.knownPrice
      },
      {
        lowerTickExists,
        upperTickExists,
        pool: data.poolIndex !== null ? allPools[data.poolIndex] : undefined,
        tokenXProgramAddress: allTokens[data.tokenX.toString()].tokenProgram,
        tokenYProgramAddress: allTokens[data.tokenY.toString()].tokenProgram,
        positionsList: !userPositionList.loading ? userPositionList : undefined
      }
    )

    combinedTransaction.add(initPositionTx)
    combinedTransaction.add(unwrapIx)

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    combinedTransaction.recentBlockhash = blockhash
    combinedTransaction.lastValidBlockHeight = lastValidBlockHeight
    combinedTransaction.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    combinedTransaction.partialSign(wrappedEthAccount)

    if (poolSigners.length) {
      combinedTransaction.partialSign(...poolSigners)
    }

    const signedTx = (yield* call(
      [wallet, wallet.signTransaction],
      combinedTransaction
    )) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txId = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txId.length) {
      yield put(actions.setInitPositionSuccess(false))

      closeSnackbar(loaderCreatePosition)
      yield put(snackbarsActions.remove(loaderCreatePosition))

      return yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid: txId
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid: txId
        })
      )
      const txDetails = yield* call([connection, connection.getParsedTransaction], txId)
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
            yield put(actions.setInitPositionSuccess(false))

            closeSnackbar(loaderCreatePosition)
            yield put(snackbarsActions.remove(loaderCreatePosition))
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

        const meta = txDetails.meta
        if (meta?.innerInstructions && meta.innerInstructions) {
          try {
            const targetInner = meta.innerInstructions[2] ?? meta.innerInstructions[0]

            const nativeAmount = (
              targetInner.instructions.find(
                ix => (ix as ParsedInstruction).parsed.info.amount
              ) as ParsedInstruction
            ).parsed.info.amount

            const splAmount = (
              targetInner.instructions.find(
                ix => (ix as ParsedInstruction).parsed.info.tokenAmount !== undefined
              ) as ParsedInstruction
            ).parsed.info.tokenAmount.amount

            const tokenX = allTokens[pair.tokenX.toString()]
            const tokenY = allTokens[pair.tokenY.toString()]

            const nativeX = pair.tokenX.equals(NATIVE_MINT)

            const amountX = nativeX ? nativeAmount : splAmount
            const amountY = nativeX ? splAmount : nativeAmount

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'deposit',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                },
                persist: false
              })
            )
          } catch {
            // Should never be triggered
          }
        }
      }

      yield put(actions.getPositionsList())
    }

    yield put(actions.setInitPositionSuccess(true))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

export function* handleSwapAndInitPositionWithETH(
  action: PayloadAction<SwapAndCreatePosition>
): Generator {
  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)

    yield put(
      snackbarsActions.add({
        message: 'Creating position',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)

    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const swapPair = new Pair(action.payload.tokenX, action.payload.tokenY, {
      fee: action.payload.swapPool.fee,
      tickSpacing: action.payload.swapPool.tickSpacing
    })

    const tokensAccounts = yield* select(accounts)
    const userPositionList = yield* select(positionsList)

    const wrappedEthAccount = Keypair.generate()
    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, transferIx, unwrapIx } = createNativeAtaWithTransferInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net,
      allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? action.payload.xAmount
        : action.payload.yAmount
    )

    let userTokenX =
      allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[action.payload.tokenX.toString()]
          ? tokensAccounts[action.payload.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, action.payload.tokenX)
    }

    let userTokenY =
      allTokens[action.payload.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[action.payload.tokenY.toString()]
          ? tokensAccounts[action.payload.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, action.payload.tokenY)
    }

    const swapAndCreateOnDifferentPools = action.payload.isSamePool
      ? undefined
      : {
          positionPair: new Pair(action.payload.tokenX, action.payload.tokenY, {
            fee: action.payload.positionPair.fee,
            tickSpacing: action.payload.positionPair.tickSpacing
          }),
          positionPoolPrice: action.payload.positionPoolPrice,
          positionSlippage: action.payload.positionSlippage
        }

    const upperTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === action.payload.upperTick) !== undefined
        ? true
        : undefined
    const lowerTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === action.payload.lowerTick) !== undefined
        ? true
        : undefined

    const isInitialEthZero =
      (allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.xAmount.eq(new BN(0))) ||
      (allTokens[action.payload.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.yAmount.eq(new BN(0)))

    const prependedIxs = [createIx, ...(isInitialEthZero ? [] : [transferIx]), initIx]

    const tx = yield* call(
      [marketProgram, marketProgram.versionedSwapAndCreatePositionTx],
      {
        amountX: action.payload.xAmount,
        amountY: action.payload.yAmount,
        swapPair,
        userTokenX,
        userTokenY,
        lowerTick: action.payload.lowerTick,
        upperTick: action.payload.upperTick,
        owner: wallet.publicKey,
        slippage: action.payload.swapSlippage,
        amount: action.payload.swapAmount,
        xToY: action.payload.xToY,
        byAmountIn: action.payload.byAmountIn,
        estimatedPriceAfterSwap: action.payload.estimatedPriceAfterSwap,
        minUtilizationPercentage: action.payload.minUtilizationPercentage,
        liquidityDelta: action.payload.liquidityDelta,
        swapAndCreateOnDifferentPools
      },
      { tickIndexes: action.payload.crossedTicks },
      {
        position: {
          lowerTickExists,
          upperTickExists,
          pool:
            action.payload.positionPoolIndex !== null
              ? allPools[action.payload.positionPoolIndex]
              : undefined,
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        },
        swap: {
          tickmap: action.payload.swapPoolTickmap,
          pool: action.payload.swapPool
        }
      },
      prependedIxs,
      [unwrapIx]
    )
    const xToY = action.payload.xToY

    const tokenX = xToY
      ? allTokens[swapPair.tokenX.toString()]
      : allTokens[swapPair.tokenY.toString()]
    const tokenY = xToY
      ? allTokens[swapPair.tokenY.toString()]
      : allTokens[swapPair.tokenX.toString()]

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const serializedMessage = tx.message.serialize()
    const signatureUint8 = nacl.sign.detached(serializedMessage, wrappedEthAccount.secretKey)

    tx.addSignature(wrappedEthAccount.publicKey, signatureUint8)
    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as VersionedTransaction

    closeSnackbar(loaderSigningTx)

    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call([connection, connection.sendTransaction], signedTx)

    yield* call([connection, connection.confirmTransaction], txid)

    yield put(actions.setInitPositionSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )
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
            yield put(actions.setInitPositionSuccess(false))

            closeSnackbar(loaderCreatePosition)
            yield put(snackbarsActions.remove(loaderCreatePosition))
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

        const meta = txDetails.meta
        if (meta?.innerInstructions && meta.innerInstructions) {
          try {
            const index = meta.innerInstructions.length
            const targetInner = meta.innerInstructions[index - 1]
            const depositInstructions = targetInner.instructions.slice(5)

            const exchangeInstructions = targetInner.instructions.slice(1, 3)

            const fromExchangeAmount =
              (exchangeInstructions[1] as ParsedInstruction).parsed?.info?.amount ??
              (exchangeInstructions[1] as ParsedInstruction).parsed?.info?.tokenAmount?.amount

            const toExchangeAmount =
              (exchangeInstructions[0] as ParsedInstruction).parsed?.info?.amount ??
              (exchangeInstructions[0] as ParsedInstruction).parsed?.info?.tokenAmount?.amount

            const tokenXDeposit =
              (depositInstructions[xToY ? 0 : 1] as ParsedInstruction).parsed?.info?.amount ??
              (depositInstructions[xToY ? 0 : 1] as ParsedInstruction).parsed?.info?.tokenAmount
                ?.amount

            const tokenYDeposit =
              (depositInstructions[xToY ? 1 : 0] as ParsedInstruction).parsed?.info?.amount ??
              (depositInstructions[xToY ? 1 : 0] as ParsedInstruction).parsed?.info?.tokenAmount
                ?.amount

            const match = autoSwapPools.find(
              ({ pair }) =>
                (pair.tokenX.equals(tokenX.address) && pair.tokenY.equals(tokenY.address)) ||
                (pair.tokenX.equals(tokenY.address) && pair.tokenY.equals(tokenX.address))
            )

            const feeTier = match?.swapPool.feeIndex ?? null

            let points = new BN(0)

            if (
              leaderboardConfig.swapPairs.some(
                item =>
                  (new PublicKey(item.tokenX).equals(action.payload.swapPool.tokenX) &&
                    new PublicKey(item.tokenY).equals(action.payload.swapPool.tokenY)) ||
                  (new PublicKey(item.tokenY).equals(action.payload.swapPool.tokenX) &&
                    new PublicKey(item.tokenX).equals(action.payload.swapPool.tokenY))
              )
            ) {
              const feed = feeds[tokenX.address.toString()]

              points = calculatePoints(
                new BN(fromExchangeAmount),
                tokenX.decimals,
                FEE_TIERS[feeTier ?? ''].fee,
                feed.price,
                feed.priceDecimals,
                new BN(leaderboardConfig.pointsPerUsd, 'hex')
              ).muln(Number(leaderboardConfig.swapMultiplier))
            }

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'deposit',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(tokenXDeposit, tokenX.decimals)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(tokenYDeposit, tokenY.decimals)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString(),
                  tokenXAmountAutoSwap: formatNumberWithoutSuffix(
                    printBN(fromExchangeAmount, tokenX.decimals)
                  ),
                  tokenYAmountAutoSwap: formatNumberWithoutSuffix(
                    printBN(toExchangeAmount, tokenY.decimals)
                  ),
                  tokenXIconAutoSwap: tokenX.logoURI,
                  tokenYIconAutoSwap: tokenY.logoURI,
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
      }

      yield put(actions.getPositionsList())
    }

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleSwapAndInitPosition(
  action: PayloadAction<SwapAndCreatePosition>
): Generator {
  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)

    if (
      allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[action.payload.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleSwapAndInitPositionWithETH, action)
    }

    yield put(
      snackbarsActions.add({
        message: 'Creating position',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const feeds = yield* select(priceFeeds)
    const leaderboardConfig = yield* select(config)
    const rpc = yield* select(rpcAddress)
    const userPositionList = yield* select(positionsList)
    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)

    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const swapPair = new Pair(action.payload.tokenX, action.payload.tokenY, {
      fee: action.payload.swapPool.fee,
      tickSpacing: action.payload.swapPool.tickSpacing
    })

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[action.payload.tokenX.toString()]
      ? tokensAccounts[action.payload.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, action.payload.tokenX)
    }

    let userTokenY = tokensAccounts[action.payload.tokenY.toString()]
      ? tokensAccounts[action.payload.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, action.payload.tokenY)
    }

    const swapAndCreateOnDifferentPools = action.payload.isSamePool
      ? undefined
      : {
          positionPair: new Pair(action.payload.tokenX, action.payload.tokenY, {
            fee: action.payload.positionPair.fee,
            tickSpacing: action.payload.positionPair.tickSpacing
          }),
          positionPoolPrice: action.payload.positionPoolPrice,
          positionSlippage: action.payload.positionSlippage
        }

    const upperTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === action.payload.upperTick) !== undefined
        ? true
        : undefined
    const lowerTickExists =
      !ticks.hasError &&
      !ticks.loading &&
      ticks.rawTickIndexes.find(t => t === action.payload.lowerTick) !== undefined
        ? true
        : undefined
    const tx = yield* call(
      [marketProgram, marketProgram.versionedSwapAndCreatePositionTx],
      {
        amountX: action.payload.xAmount,
        amountY: action.payload.yAmount,
        swapPair,
        userTokenX,
        userTokenY,
        lowerTick: action.payload.lowerTick,
        upperTick: action.payload.upperTick,
        owner: wallet.publicKey,
        slippage: action.payload.swapSlippage,
        amount: action.payload.swapAmount,
        xToY: action.payload.xToY,
        byAmountIn: action.payload.byAmountIn,
        estimatedPriceAfterSwap: action.payload.estimatedPriceAfterSwap,
        minUtilizationPercentage: action.payload.minUtilizationPercentage,
        swapAndCreateOnDifferentPools,
        liquidityDelta: action.payload.liquidityDelta
      },
      { tickIndexes: action.payload.crossedTicks },
      {
        position: {
          lowerTickExists,
          upperTickExists,
          pool:
            action.payload.positionPoolIndex !== null
              ? allPools[action.payload.positionPoolIndex]
              : undefined,
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        },
        swap: {
          tickmap: action.payload.swapPoolTickmap,
          pool: action.payload.swapPool
        }
      }
    )

    const xToY = action.payload.xToY
    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as VersionedTransaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call([connection, connection.sendTransaction], signedTx)

    yield* call([connection, connection.confirmTransaction], txid)

    yield put(actions.setInitPositionSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again.',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully.',
          variant: 'success',
          persist: false,
          txid
        })
      )

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
            yield put(actions.setInitPositionSuccess(false))

            closeSnackbar(loaderCreatePosition)
            yield put(snackbarsActions.remove(loaderCreatePosition))
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

        const meta = txDetails.meta
        const tokenX = xToY
          ? allTokens[swapPair.tokenX.toString()]
          : allTokens[swapPair.tokenY.toString()]
        const tokenY = xToY
          ? allTokens[swapPair.tokenY.toString()]
          : allTokens[swapPair.tokenX.toString()]

        if (meta?.innerInstructions && meta.innerInstructions) {
          try {
            const targetInner = meta.innerInstructions[2] ?? meta.innerInstructions[0]
            targetInner.instructions.slice(1, 3)
            const tokenXDeposit = targetInner.instructions
              .slice(5)
              .find(
                (ix): ix is ParsedInstruction =>
                  (ix as ParsedInstruction).parsed?.info?.mint === tokenX.address.toString()
              )?.parsed?.info?.tokenAmount

            const tokenYDeposit = targetInner.instructions
              .slice(5)
              .find(
                (ix): ix is ParsedInstruction =>
                  (ix as ParsedInstruction).parsed?.info?.mint === tokenY.address.toString()
              )?.parsed?.info?.tokenAmount

            const tokenXExchange = targetInner.instructions
              .slice(1, 3)
              .find(
                (ix): ix is ParsedInstruction =>
                  (ix as ParsedInstruction).parsed.info?.mint === tokenX.address.toString()
              )?.parsed.info.tokenAmount.amount

            const tokenYExchange = targetInner.instructions
              .slice(1, 3)
              .find(
                (ix): ix is ParsedInstruction =>
                  (ix as ParsedInstruction).parsed.info?.mint === tokenY.address.toString()
              )?.parsed.info.tokenAmount.amount

            const match = autoSwapPools.find(
              ({ pair }) =>
                (pair.tokenX.equals(tokenX.address) && pair.tokenY.equals(tokenY.address)) ||
                (pair.tokenX.equals(tokenY.address) && pair.tokenY.equals(tokenX.address))
            )

            const feeTier = match?.swapPool.feeIndex ?? null

            const amountX = tokenXDeposit?.amount
            const amountY = tokenYDeposit?.amount
            const tokenXDecimal = tokenXDeposit?.decimals
            const tokenYDecimal = tokenYDeposit?.decimals
            let points = new BN(0)

            if (
              leaderboardConfig.swapPairs.some(
                item =>
                  (new PublicKey(item.tokenX).equals(action.payload.swapPool.tokenX) &&
                    new PublicKey(item.tokenY).equals(action.payload.swapPool.tokenY)) ||
                  (new PublicKey(item.tokenY).equals(action.payload.swapPool.tokenX) &&
                    new PublicKey(item.tokenX).equals(action.payload.swapPool.tokenY))
              )
            ) {
              const feed = feeds[tokenX.address.toString()]

              points = calculatePoints(
                new BN(tokenXExchange),
                tokenX.decimals,
                FEE_TIERS[feeTier ?? ''].fee,
                feed.price,
                feed.priceDecimals,
                new BN(leaderboardConfig.pointsPerUsd, 'hex')
              ).muln(Number(leaderboardConfig.swapMultiplier))
            }

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'deposit',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenXDecimal)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenYDecimal)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString(),
                  tokenXAmountAutoSwap: formatNumberWithoutSuffix(
                    printBN(tokenXExchange, tokenX.decimals)
                  ),
                  tokenYAmountAutoSwap: formatNumberWithoutSuffix(
                    printBN(tokenYExchange, tokenY.decimals)
                  ),
                  tokenXIconAutoSwap: tokenX.logoURI,
                  tokenYIconAutoSwap: tokenY.logoURI,
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
      }

      yield put(actions.getPositionsList())
    }

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield* call(handleRpcError, (error as Error).message)
  }
}
export function* handleInitPosition(action: PayloadAction<InitPositionData>): Generator {
  const loaderCreatePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)

    if (
      (allTokens[action.payload.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.xAmount !== 0) ||
      (allTokens[action.payload.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS &&
        action.payload.yAmount !== 0)
    ) {
      return yield* call(handleInitPositionWithETH, action)
    }

    yield put(
      snackbarsActions.add({
        message: 'Creating position...',
        variant: 'pending',
        persist: true,
        key: loaderCreatePosition
      })
    )

    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)

    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    marketProgram.setWallet({
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
      publicKey: wallet.publicKey
    } as IWallet)

    const allPools = yield* select(poolsArraySortedByFees)
    const ticks = yield* select(plotTicks)
    const pair = new Pair(action.payload.tokenX, action.payload.tokenY, {
      fee: action.payload.fee,
      tickSpacing: action.payload.tickSpacing
    })

    const userPositionList = yield* select(positionsList)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[action.payload.tokenX.toString()]
      ? tokensAccounts[action.payload.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, action.payload.tokenX)
    }

    let userTokenY = tokensAccounts[action.payload.tokenY.toString()]
      ? tokensAccounts[action.payload.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, action.payload.tokenY)
    }

    let tx: Transaction
    let createPoolTx: Transaction | null = null
    let poolSigners: Keypair[] = []

    if (action.payload.initPool) {
      const txs = yield* call(
        [marketProgram, marketProgram.createPoolWithSqrtPriceAndPositionTx],
        {
          pair,
          userTokenX,
          userTokenY,
          lowerTick: action.payload.lowerTick,
          upperTick: action.payload.upperTick,
          liquidityDelta: action.payload.liquidityDelta,
          owner: wallet.publicKey,
          slippage: action.payload.slippage,
          knownPrice: action.payload.knownPrice
        },
        undefined,
        {
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        }
      )
      tx = txs.createPositionTx
      createPoolTx = txs.createPoolTx
      poolSigners = txs.createPoolSigners
    } else {
      tx = yield* call(
        [marketProgram, marketProgram.createPositionTx],
        {
          pair,
          userTokenX,
          userTokenY,
          lowerTick: action.payload.lowerTick,
          upperTick: action.payload.upperTick,
          liquidityDelta: action.payload.liquidityDelta,
          owner: wallet.publicKey,
          slippage: action.payload.slippage,
          knownPrice: action.payload.knownPrice
        },
        {
          lowerTickExists:
            !ticks.hasError &&
            !ticks.loading &&
            ticks.rawTickIndexes.find(t => t === action.payload.lowerTick) !== undefined
              ? true
              : undefined,
          upperTickExists:
            !ticks.hasError &&
            !ticks.loading &&
            ticks.rawTickIndexes.find(t => t === action.payload.upperTick) !== undefined
              ? true
              : undefined,
          pool: action.payload.poolIndex !== null ? allPools[action.payload.poolIndex] : undefined,
          tokenXProgramAddress: allTokens[action.payload.tokenX.toString()].tokenProgram,
          tokenYProgramAddress: allTokens[action.payload.tokenY.toString()].tokenProgram,
          positionsList: !userPositionList.loading ? userPositionList : undefined
        }
      )
    }

    if (createPoolTx) {
      createPoolTx.feePayer = wallet.publicKey
      const { blockhash, lastValidBlockHeight } = yield* call([
        connection,
        connection.getLatestBlockhash
      ])
      createPoolTx.recentBlockhash = blockhash
      createPoolTx.lastValidBlockHeight = lastValidBlockHeight

      yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))
      if (poolSigners.length) {
        createPoolTx.partialSign(...poolSigners)
      }
      const signedTx = (yield* call([wallet, wallet.signTransaction], createPoolTx)) as Transaction

      closeSnackbar(loaderSigningTx)

      yield put(snackbarsActions.remove(loaderSigningTx))

      yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
        skipPreflight: false
      })
    }

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))
    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey
    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    yield put(actions.setInitPositionSuccess(!!txid.length))

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Position adding failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position added successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

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
            yield put(actions.setInitPositionSuccess(false))

            closeSnackbar(loaderCreatePosition)
            yield put(snackbarsActions.remove(loaderCreatePosition))
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

        const meta = txDetails.meta
        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === pair.tokenX.toString() && entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === pair.tokenY.toString() && entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount
            const amountX = new BN(preAmountX).sub(new BN(postAmountX))
            const amountY = new BN(postAmountY).sub(new BN(preAmountY))
            try {
              const tokenX = allTokens[pair.tokenX.toString()]
              const tokenY = allTokens[pair.tokenY.toString()]

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'deposit',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                    tokenXIcon: tokenX.logoURI,
                    tokenYIcon: tokenY.logoURI,
                    tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                    tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                  },
                  persist: false
                })
              )
            } catch {}
          }
        }
      }

      yield put(actions.getPositionsList())
    }

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

    yield put(actions.setInitPositionSuccess(false))

    closeSnackbar(loaderCreatePosition)
    yield put(snackbarsActions.remove(loaderCreatePosition))
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

export function* handleGetCurrentPlotTicks(action: PayloadAction<GetCurrentTicksData>): Generator {
  const allPools = yield* select(poolsArraySortedByFees)
  const allTokens = yield* select(tokens)

  const { poolIndex, isXtoY } = action.payload

  const xDecimal = allTokens[allPools[poolIndex].tokenX.toString()].decimals
  const yDecimal = allTokens[allPools[poolIndex].tokenY.toString()].decimals

  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const rawTicks = yield* call(
      [marketProgram, marketProgram.getAllTicks],
      new Pair(allPools[poolIndex].tokenX, allPools[poolIndex].tokenY, {
        fee: allPools[poolIndex].fee,
        tickSpacing: allPools[poolIndex].tickSpacing
      })
    )

    const { list } = yield* select(positionsList)
    const userTicks = getLiquidityTicksByPositionsList(
      allPools[poolIndex],
      list,
      isXtoY,
      xDecimal,
      yDecimal
    )

    const ticksData = createLiquidityPlot(
      rawTicks,
      allPools[poolIndex],
      action.payload.isXtoY,
      xDecimal,
      yDecimal
    )

    yield put(
      actions.setPlotTicks({
        allPlotTicks: ticksData,
        userPlotTicks: userTicks,
        rawTickIndexes: rawTicks.map(t => t.index)
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    const data = createPlaceholderLiquidityPlot(
      action.payload.isXtoY,
      10,
      allPools[poolIndex].tickSpacing,
      xDecimal,
      yDecimal
    )
    yield put(actions.setErrorPlotTicks(data))

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetPositionsList() {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    if (!wallet) {
      yield* put(actions.setLockedPositionsList([]))
      yield* put(actions.setPositionsList([[], { head: 0, bump: 0 }, false]))
      return
    }

    const { head, bump } = yield* call(
      [marketProgram, marketProgram.getPositionList],
      wallet.publicKey
    )

    const { list, addresses } = yield* all({
      list: call(
        [marketProgram, marketProgram.getPositionsFromRange],
        wallet.publicKey,
        0,
        head - 1
      ),
      addresses: call(getPositionsAddressesFromRange, marketProgram, wallet.publicKey, 0, head - 1)
    })

    const pools = new Set(list.map(pos => pos.pool.toString()))

    const [lockerAuth] = lockerProgram.getUserLocksAddress(wallet.publicKey)

    let lockedPositions: (Position & { address: PublicKey })[] = []

    try {
      const { head: lockedHead } = yield* call(
        [marketProgram, marketProgram.getPositionList],
        lockerAuth
      )

      const { lockedList, lockedAddresses } = yield* all({
        lockedList: call(
          [marketProgram, marketProgram.getPositionsFromRange],
          lockerAuth,
          0,
          lockedHead - 1
        ),
        lockedAddresses: call(
          getPositionsAddressesFromRange,
          marketProgram,
          lockerAuth,
          0,
          lockedHead - 1
        )
      })

      lockedPositions = lockedList.map((position, index) => ({
        ...position,
        address: lockedAddresses[index]
      }))
    } catch (e: unknown) {
      const error = ensureError(e)
      console.log(error)

      lockedPositions = []
    }

    lockedPositions.forEach(lock => {
      pools.add(lock.pool.toString())
    })

    yield* put(
      poolsActions.getPoolsDataForList({
        addresses: Array.from(pools),
        listType: ListType.POSITIONS
      })
    )
    yield* take(poolsActions.addPoolsForList.type)

    const poolsList = yield* select(poolsArraySortedByFees)
    const positions = list.map((position, index) => {
      return {
        ...position,
        address: addresses[index]
      }
    })

    const positionsWithTicks: PositionWithAddress[] = []
    const tickAddresses = new Set<PublicKey>()

    const totalPositions = [...positions, ...lockedPositions]
    for (const position of totalPositions) {
      const pool = poolsList.find(pool => pool.address.toString() === position.pool.toString())

      if (!pool) {
        continue
      }

      const pair = new Pair(pool.tokenX, pool.tokenY, {
        fee: pool.fee,
        tickSpacing: pool.tickSpacing
      })

      const lowerTickAddress = marketProgram.getTickAddress(pair, position.lowerTickIndex)
      const upperTickAddress = marketProgram.getTickAddress(pair, position.upperTickIndex)

      tickAddresses.add(lowerTickAddress.tickAddress).add(upperTickAddress.tickAddress)
    }

    const ticks = yield* call(getTicksFromAddresses, marketProgram, [...tickAddresses])

    let offset = 0

    for (let i = 0; i < positions.length; i++) {
      if (!ticks[i] || !ticks[i + 1]) {
        continue
      }
      const lowerTick = parseTick(ticks[offset]!)
      const upperTick = parseTick(ticks[offset + 1]!)

      positionsWithTicks[i] = {
        ...positions[i],
        lowerTick: lowerTick,
        upperTick: upperTick,
        ticksLoading: false
      }
      offset += 2
    }
    const lockedPositionsWithTicks: PositionWithAddress[] = []

    for (let i = 0; i < lockedPositions.length; i++) {
      if (!ticks[i] || !ticks[i + 1]) {
        continue
      }

      const lowerTick = parseTick(ticks[offset]!)
      const upperTick = parseTick(ticks[offset + 1]!)

      lockedPositionsWithTicks[i] = {
        ...lockedPositions[i],
        lowerTick: lowerTick,
        upperTick: upperTick,
        ticksLoading: false
      }
      offset += 2
    }

    yield* put(
      poolsActions.getPoolsDataForList({
        addresses: Array.from(pools),
        listType: ListType.POSITIONS
      })
    )

    const pattern: GuardPredicate<PayloadAction<ListPoolsResponse>> = (
      action
    ): action is PayloadAction<ListPoolsResponse> => {
      return (
        typeof action?.payload?.listType !== 'undefined' &&
        action.payload.listType === ListType.POSITIONS
      )
    }

    yield* take(pattern)

    yield* put(actions.setLockedPositionsList(lockedPositionsWithTicks))
    yield* put(actions.setPositionsList([positionsWithTicks, { head, bump }, true]))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLockedPositionsList([]))
    yield* put(actions.setPositionsList([[], { head: 0, bump: 0 }, false]))

    yield* call(handleRpcError, error.message)
  }
}

export function* handleClaimFeeWithETH({ index, isLocked }: { index: number; isLocked: boolean }) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Claiming fee...',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    const data = isLocked ? lockedPositionsWithPoolsData : positionsWithPoolsData
    const allPositionsData = yield* select(data)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net
    )

    const poolForIndex = allPositionsData[index].poolData
    const position = allPositionsData[index]

    let userTokenX =
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenX.toString()]
          ? tokensAccounts[poolForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY =
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenY.toString()]
          ? tokensAccounts[poolForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const tx = new Transaction().add(createIx).add(initIx)
    const pair = new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
      fee: poolForIndex.fee,
      tickSpacing: poolForIndex.tickSpacing
    })
    if (isLocked) {
      const ix = yield* call(
        [lockerProgram, lockerProgram.claimFeeIx],
        {
          authorityListIndex: index,
          market: marketProgram as any,
          pair,
          userTokenX,
          userTokenY
        },
        wallet.publicKey
      )
      tx.add(...ix).add(unwrapIx)
    } else {
      const ix = yield* call(
        [marketProgram, marketProgram.claimFeeIx],
        {
          pair,
          userTokenX,
          userTokenY,
          owner: wallet.publicKey,
          index: index
        },
        {
          position: position,
          pool: poolForIndex,
          tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
        }
      )
      tx.add(ix).add(unwrapIx)
    }

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    tx.partialSign(wrappedEthAccount)

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(actions.getPositionsList())

      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

      if (txDetails) {
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

            const tokenX = allTokens[pair.tokenX.toString()]
            const tokenY = allTokens[pair.tokenY.toString()]

            const nativeX = pair.tokenX.equals(NATIVE_MINT)

            const amountX = nativeX ? nativeAmount : splAmount
            const amountY = nativeX ? splAmount : nativeAmount

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'claim',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                },
                persist: false
              })
            )
          } catch {
            // Should never be triggered
          }
        }
      }
    }

    yield put(actions.getSinglePosition({ index, isLocked }))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
    yield put(actions.setFeesLoader(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    yield put(actions.setFeesLoader(false))

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

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
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

export function* handleClaimFee(action: PayloadAction<{ index: number; isLocked: boolean }>) {
  const loaderClaimFee = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const data = action.payload.isLocked ? lockedPositionsWithPoolsData : positionsWithPoolsData
    const allPositionsData = yield* select(data)
    const position = allPositionsData[action.payload.index]
    const poolForIndex = position.poolData

    if (
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClaimFeeWithETH, action.payload)
    }

    yield put(
      snackbarsActions.add({
        message: 'Claiming fee...',
        variant: 'pending',
        persist: true,
        key: loaderClaimFee
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)

    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[poolForIndex.tokenX.toString()]
      ? tokensAccounts[poolForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[poolForIndex.tokenY.toString()]
      ? tokensAccounts[poolForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const tx = new Transaction()
    const pair = new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
      fee: poolForIndex.fee,
      tickSpacing: poolForIndex.tickSpacing
    })
    if (action.payload.isLocked) {
      const ix = yield* call(
        [lockerProgram, lockerProgram.claimFeeIx],
        {
          authorityListIndex: action.payload.index,
          market: marketProgram as any,
          pair,
          userTokenX,
          userTokenY
        },
        wallet.publicKey
      )
      tx.add(...ix)
    } else {
      const ix = yield* call(
        [marketProgram, marketProgram.claimFeeIx],
        {
          pair,
          userTokenX,
          userTokenY,
          owner: wallet.publicKey,
          index: action.payload.index
        },
        {
          position: position,
          pool: poolForIndex,
          tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
          tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
        }
      )
      tx.add(ix)
    }

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to claim fee. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(actions.getPositionsList())

      yield put(
        snackbarsActions.add({
          message: 'Fee claimed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

      if (txDetails) {
        const meta = txDetails.meta
        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === pair.tokenX.toString() && entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === pair.tokenY.toString() && entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount
            const amountX = new BN(postAmountX).sub(new BN(preAmountX))
            const amountY = new BN(postAmountY).sub(new BN(preAmountY))
            try {
              const tokenX = allTokens[pair.tokenX.toString()]
              const tokenY = allTokens[pair.tokenY.toString()]

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'claim',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                    tokenXIcon: tokenX.logoURI,
                    tokenYIcon: tokenY.logoURI,
                    tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                    tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                  },
                  persist: false
                })
              )
            } catch {}
          }
        }
      }
    }

    yield put(actions.getSinglePosition(action.payload))

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
    yield put(actions.setFeesLoader(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    yield put(actions.setFeesLoader(false))
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

    closeSnackbar(loaderClaimFee)
    yield put(snackbarsActions.remove(loaderClaimFee))
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

export function* handleClaimAllFees() {
  const loaderClaimAllFees = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const allTokens = yield* select(tokens)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const positionsData = yield* select(positionsWithPoolsData)
    const filteredPositions = positionsData.filter(position => {
      const [bnX, bnY] = calculateClaimAmount({
        position: position,
        tickLower: position.lowerTick,
        tickUpper: position.upperTick,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      return !bnX.isZero() || !bnY.isZero()
    })
    const tokensAccounts = yield* select(accounts)

    if (filteredPositions.length === 0) {
      return
    }
    if (filteredPositions.length === 1) {
      const claimFeeAction = actions.claimFee({ index: 0, isLocked: filteredPositions[0].isLocked })
      return yield* call(handleClaimFee, claimFeeAction)
    }

    yield* put(actions.setAllClaimLoader(true))
    yield put(
      snackbarsActions.add({
        message: 'Claiming all fees',
        variant: 'pending',
        persist: true,
        key: loaderClaimAllFees
      })
    )
    for (const position of filteredPositions) {
      const pool = positionsData[position.positionIndex].poolData
      if (!tokensAccounts[pool.tokenX.toString()]) {
        yield* call(createAccount, pool.tokenX)
      }
      if (!tokensAccounts[pool.tokenY.toString()]) {
        yield* call(createAccount, pool.tokenY)
      }
    }
    const formattedPositions = filteredPositions.map(position => ({
      pair: new Pair(position.poolData.tokenX, position.poolData.tokenY, {
        fee: position.poolData.fee,
        tickSpacing: position.poolData.tickSpacing
      }),
      index: position.positionIndex,
      lowerTickIndex: position.lowerTickIndex,
      upperTickIndex: position.upperTickIndex
    }))

    const txs = yield* call([marketProgram, marketProgram.claimAllFeesTxs], {
      owner: wallet.publicKey,
      positions: formattedPositions
    } as ClaimAllFee)

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    for (const { tx, additionalSigner } of txs) {
      const { blockhash, lastValidBlockHeight } = yield* call([
        connection,
        connection.getLatestBlockhash
      ])
      tx.recentBlockhash = blockhash
      tx.lastValidBlockHeight = lastValidBlockHeight
      tx.feePayer = wallet.publicKey

      let signedTx: Transaction
      if (additionalSigner) {
        tx.partialSign(additionalSigner)

        const partiallySignedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

        signedTx = partiallySignedTx
      } else {
        signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction
      }

      const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
        skipPreflight: false
      })

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

      if (txDetails) {
        const meta = txDetails.meta
        if (meta?.innerInstructions && meta.innerInstructions) {
          for (const metaInstructions of meta.innerInstructions) {
            try {
              const nativeTransfer = metaInstructions.instructions.find(
                ix => (ix as ParsedInstruction).parsed.info.amount
              ) as ParsedInstruction

              const nativeAmount = nativeTransfer ? nativeTransfer.parsed.info.amount : 0

              const splTransfers = metaInstructions.instructions.filter(
                ix => (ix as ParsedInstruction).parsed.info.tokenAmount !== undefined
              ) as ParsedInstruction[]

              let tokenXAmount = '0'
              let tokenYAmount = '0'
              let tokenXIcon = unknownTokenIcon
              let tokenYIcon = unknownTokenIcon
              let tokenXSymbol = 'Unknown'
              let tokenYSymbol = 'Unknown'

              if (nativeTransfer) {
                tokenXAmount = formatNumberWithoutSuffix(
                  printBN(nativeAmount, allTokens[NATIVE_MINT.toString()].decimals)
                )
                tokenXIcon = allTokens[NATIVE_MINT.toString()].logoURI
                tokenXSymbol = allTokens[NATIVE_MINT.toString()].symbol ?? NATIVE_MINT.toString()
              }

              splTransfers.map((transfer, index) => {
                const token = allTokens[transfer.parsed.info.mint]
                const amount = transfer.parsed.info.tokenAmount.amount
                if (index === 0) {
                  tokenYAmount = formatNumberWithoutSuffix(printBN(amount, token.decimals))
                  tokenYIcon = token.logoURI
                } else if (index === 1 && !nativeTransfer) {
                  tokenXAmount = formatNumberWithoutSuffix(printBN(amount, token.decimals))
                  tokenXIcon = token.logoURI
                  tokenYSymbol = token.symbol ?? token.address.toString()
                }
              })

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'claim',
                    tokenXAmount: tokenXAmount,
                    tokenYAmount: tokenYAmount,
                    tokenXIcon: tokenXIcon,
                    tokenYIcon: tokenYIcon,
                    tokenXSymbol: tokenXSymbol,
                    tokenYSymbol: tokenYSymbol
                  },
                  persist: false
                })
              )
            } catch {
              // Should never be triggered
            }
          }
        }
      }

      if (!txid.length) {
        yield put(
          snackbarsActions.add({
            message: 'Failed to claim some fees. Please try again.',
            variant: 'error',
            persist: false,
            txid
          })
        )
      }
    }

    yield put(
      snackbarsActions.add({
        message: 'All fees claimed successfully.',
        variant: 'success',
        persist: false
      })
    )

    for (const position of positionsData) {
      yield put(
        actions.getSinglePosition({ index: position.positionIndex, isLocked: position.isLocked })
      )
    }

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    closeSnackbar(loaderClaimAllFees)
    yield put(snackbarsActions.remove(loaderClaimAllFees))

    yield put(actions.getPositionsList())

    yield* put(actions.setAllClaimLoader(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
    yield* put(actions.setAllClaimLoader(false))
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

    closeSnackbar(loaderClaimAllFees)
    yield put(snackbarsActions.remove(loaderClaimAllFees))
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

export function* handleClosePositionWithETH(data: ClosePositionData) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    yield put(
      snackbarsActions.add({
        message: 'Closing position...',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const allPositionsData = yield* select(positionsWithPoolsData)
    const tokensAccounts = yield* select(accounts)
    const allTokens = yield* select(tokens)
    const userPositionList = yield* select(positionsList)

    const wrappedEthAccount = Keypair.generate()

    const net = networkTypetoProgramNetwork(networkType)

    const { createIx, initIx, unwrapIx } = createNativeAtaInstructions(
      wrappedEthAccount.publicKey,
      wallet.publicKey,
      net
    )
    const position = allPositionsData[data.positionIndex]
    const poolForIndex = position.poolData

    let userTokenX =
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenX.toString()]
          ? tokensAccounts[poolForIndex.tokenX.toString()].address
          : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY =
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
        ? wrappedEthAccount.publicKey
        : tokensAccounts[poolForIndex.tokenY.toString()]
          ? tokensAccounts[poolForIndex.tokenY.toString()].address
          : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }
    const pair = new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
      fee: poolForIndex.fee,
      tickSpacing: poolForIndex.tickSpacing
    })
    const ix = yield* call(
      [marketProgram, marketProgram.removePositionIx],
      {
        pair,
        owner: wallet.publicKey,
        index: data.positionIndex,
        userTokenX,
        userTokenY
      },
      {
        position: position,
        pool: poolForIndex,
        tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram,
        positionList: !userPositionList.loading ? userPositionList : undefined
      }
    )

    const tx: Transaction = new Transaction().add(createIx).add(initIx).add(ix).add(unwrapIx)

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))
    yield put(actions.setShouldDisable(true))

    tx.partialSign(wrappedEthAccount)

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

      if (txDetails) {
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

            const tokenX = allTokens[pair.tokenX.toString()]
            const tokenY = allTokens[pair.tokenY.toString()]

            const nativeX = pair.tokenX.equals(NATIVE_MINT)

            const amountX = nativeX ? nativeAmount : splAmount
            const amountY = nativeX ? splAmount : nativeAmount

            yield put(
              snackbarsActions.add({
                tokensDetails: {
                  ikonType: 'withdraw',
                  tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                  tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                  tokenXIcon: tokenX.logoURI,
                  tokenYIcon: tokenY.logoURI,
                  tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                  tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                },
                persist: false
              })
            )
          } catch {
            // Should never be triggered
          }
        }
      }
    }

    yield put(actions.getPositionsList())
    yield put(actions.setShouldDisable(false))

    data.onSuccess()

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
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
    yield put(actions.setShouldDisable(false))

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
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

export function* handleClosePosition(action: PayloadAction<ClosePositionData>) {
  const loaderClosePosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const allTokens = yield* select(tokens)
    const allPositionsData = yield* select(positionsWithPoolsData)
    const poolForIndex = allPositionsData[action.payload.positionIndex].poolData
    const position = allPositionsData[action.payload.positionIndex]

    if (
      allTokens[poolForIndex.tokenX.toString()].address.toString() === WRAPPED_ETH_ADDRESS ||
      allTokens[poolForIndex.tokenY.toString()].address.toString() === WRAPPED_ETH_ADDRESS
    ) {
      return yield* call(handleClosePositionWithETH, action.payload)
    }
    yield put(actions.setShouldDisable(true))

    yield put(
      snackbarsActions.add({
        message: 'Closing position...',
        variant: 'pending',
        persist: true,
        key: loaderClosePosition
      })
    )

    const connection = yield* call(getConnection)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const tokensAccounts = yield* select(accounts)

    let userTokenX = tokensAccounts[poolForIndex.tokenX.toString()]
      ? tokensAccounts[poolForIndex.tokenX.toString()].address
      : null

    if (userTokenX === null) {
      userTokenX = yield* call(createAccount, poolForIndex.tokenX)
    }

    let userTokenY = tokensAccounts[poolForIndex.tokenY.toString()]
      ? tokensAccounts[poolForIndex.tokenY.toString()].address
      : null

    if (userTokenY === null) {
      userTokenY = yield* call(createAccount, poolForIndex.tokenY)
    }

    const pair = new Pair(poolForIndex.tokenX, poolForIndex.tokenY, {
      fee: poolForIndex.fee,
      tickSpacing: poolForIndex.tickSpacing
    })

    const ix = yield* call(
      [marketProgram, marketProgram.removePositionIx],
      {
        pair,
        owner: wallet.publicKey,
        index: action.payload.positionIndex,
        userTokenX,
        userTokenY
      },
      {
        position,
        pool: poolForIndex,
        tokenXProgram: allTokens[poolForIndex.tokenX.toString()].tokenProgram,
        tokenYProgram: allTokens[poolForIndex.tokenY.toString()].tokenProgram
      }
    )

    const tx: Transaction = new Transaction().add(ix)

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to close position. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      yield put(
        snackbarsActions.add({
          message: 'Position closed successfully',
          variant: 'success',
          persist: false,
          txid
        })
      )

      const txDetails = yield* call([connection, connection.getParsedTransaction], txid)

      if (txDetails) {
        const meta = txDetails.meta
        if (meta?.preTokenBalances && meta.postTokenBalances) {
          const accountXPredicate = entry =>
            entry.mint === pair.tokenX.toString() && entry.owner === wallet.publicKey.toString()
          const accountYPredicate = entry =>
            entry.mint === pair.tokenY.toString() && entry.owner === wallet.publicKey.toString()

          const preAccountX = meta.preTokenBalances.find(accountXPredicate)
          const postAccountX = meta.postTokenBalances.find(accountXPredicate)
          const preAccountY = meta.preTokenBalances.find(accountYPredicate)
          const postAccountY = meta.postTokenBalances.find(accountYPredicate)

          if (preAccountX && postAccountX && preAccountY && postAccountY) {
            const preAmountX = preAccountX.uiTokenAmount.amount
            const preAmountY = preAccountY.uiTokenAmount.amount
            const postAmountX = postAccountX.uiTokenAmount.amount
            const postAmountY = postAccountY.uiTokenAmount.amount
            const amountX = new BN(postAmountX).sub(new BN(preAmountX))
            const amountY = new BN(postAmountY).sub(new BN(preAmountY))
            try {
              const tokenX = allTokens[pair.tokenX.toString()]
              const tokenY = allTokens[pair.tokenY.toString()]

              yield put(
                snackbarsActions.add({
                  tokensDetails: {
                    ikonType: 'withdraw',
                    tokenXAmount: formatNumberWithoutSuffix(printBN(amountX, tokenX.decimals)),
                    tokenYAmount: formatNumberWithoutSuffix(printBN(amountY, tokenY.decimals)),
                    tokenXIcon: tokenX.logoURI,
                    tokenYIcon: tokenY.logoURI,
                    tokenXSymbol: tokenX.symbol ?? tokenX.address.toString(),
                    tokenYSymbol: tokenY.symbol ?? tokenY.address.toString()
                  },
                  persist: false
                })
              )
            } catch {}
          }
        }
      }
    }

    yield* put(actions.getPositionsList())

    action.payload.onSuccess()
    yield put(actions.setShouldDisable(false))

    closeSnackbar(loaderClosePosition)
    yield put(snackbarsActions.remove(loaderClosePosition))
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

    closeSnackbar(loaderClosePosition)
    yield put(actions.setShouldDisable(false))

    yield put(snackbarsActions.remove(loaderClosePosition))
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

export function* handleGetSinglePosition(
  action: PayloadAction<{ index: number; isLocked: boolean }>
) {
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const lockerProgram = yield* call(getLockerProgram, networkType, rpc, wallet as IWallet)
    const [lockerAuth] = lockerProgram.getUserLocksAddress(wallet.publicKey)
    const poolsList = yield* select(poolsArraySortedByFees)

    const position = yield* call(
      [marketProgram, marketProgram.getPosition],
      action.payload.isLocked ? lockerAuth : wallet.publicKey,
      action.payload.index
    )

    const pool = poolsList.find(pool => pool.address.toString() === position.pool.toString())
    if (!pool) {
      return
    }

    const pair = new Pair(pool.tokenX, pool.tokenY, {
      fee: pool.fee,
      tickSpacing: pool.tickSpacing
    })

    yield put(poolsActions.getPoolData(pair))

    const { lowerTick, upperTick } = yield* all({
      lowerTick: call([marketProgram, marketProgram.getTick], pair, position.lowerTickIndex),
      upperTick: call([marketProgram, marketProgram.getTick], pair, position.upperTickIndex)
    })

    yield put(
      actions.setSinglePosition({
        index: action.payload.index,
        isLocked: action.payload.isLocked,
        position,
        lowerTick,
        upperTick
      })
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
  }
}

export function* handleGetPreviewPosition(action: PayloadAction<string>) {
  try {
    const parts = action.payload.split('_')
    if (parts.length !== 2) {
      throw new Error('Invalid position id')
    }
    const [id, poolAddress] = parts
    const wallet = yield* call(getWallet)
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const position = yield* call(getPositionByIdAndPoolAddress, marketProgram, id, poolAddress)

    if (position) {
      yield* put(
        poolsActions.getPoolsDataForList({
          addresses: [position.pool.toString()],
          listType: ListType.POSITIONS
        })
      )
    }
    const poolsList = yield* select(poolsArraySortedByFees)

    const pool = poolsList.find(pool => pool.address.toString() === poolAddress.toString())
    if (!pool || !position) {
      yield* put(actions.setPosition(null))
      return
    }

    const pair = new Pair(pool.tokenX, pool.tokenY, {
      fee: pool.fee,
      tickSpacing: pool.tickSpacing
    })

    const { lowerTick, upperTick } = yield* all({
      lowerTick: call([marketProgram, marketProgram.getTick], pair, position.lowerTickIndex),
      upperTick: call([marketProgram, marketProgram.getTick], pair, position.upperTickIndex)
    })

    yield* put(actions.setPosition({ ...position, lowerTick, upperTick, ticksLoading: false }))
  } catch {
    yield* put(actions.setPosition(null))
  }
}

export function* initPositionHandler(): Generator {
  yield* takeEvery(actions.initPosition, handleInitPosition)
}
export function* swapAndInitPositionHandler(): Generator {
  yield* takeLatest(actions.swapAndInitPosition, handleSwapAndInitPosition)
}
export function* getCurrentPlotTicksHandler(): Generator {
  yield* takeLatest(actions.getCurrentPlotTicks, handleGetCurrentPlotTicks)
}
export function* getPositionsListHandler(): Generator {
  yield* takeLatest(actions.getPositionsList, handleGetPositionsList)
}
export function* claimFeeHandler(): Generator {
  yield* takeEvery(actions.claimFee, handleClaimFee)
}

export function* claimAllFeeHandler(): Generator {
  yield* takeEvery(actions.claimAllFee, handleClaimAllFees)
}

export function* closePositionHandler(): Generator {
  yield* takeEvery(actions.closePosition, handleClosePosition)
}
export function* getSinglePositionHandler(): Generator {
  yield* takeEvery(actions.getSinglePosition, handleGetSinglePosition)
}
export function* getPositionHandler(): Generator {
  yield* takeEvery(actions.getPreviewPosition, handleGetPreviewPosition)
}

export function* positionsSaga(): Generator {
  yield all(
    [
      initPositionHandler,
      swapAndInitPositionHandler,
      getCurrentPlotTicksHandler,
      getPositionsListHandler,
      claimFeeHandler,
      claimAllFeeHandler,
      closePositionHandler,
      getSinglePositionHandler,
      getPositionHandler
    ].map(spawn)
  )
}
