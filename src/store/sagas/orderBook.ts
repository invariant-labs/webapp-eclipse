import { actions, AddOrderPayload } from '@store/reducers/orderBook'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { getWallet } from './wallet'
import {
  sendAndConfirmRawTransaction,
  SendTransactionError,
  Transaction,
  TransactionExpiredTimeoutError
} from '@solana/web3.js'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getConnection, handleRpcError } from './connection'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { PayloadAction } from '@reduxjs/toolkit'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as positionsActions } from '@store/reducers/positions'
import {
  APPROVAL_DENIED_MESSAGE,
  COMMON_ERROR_MESSAGE,
  ErrorCodeExtractionKeys,
  SIGNING_SNACKBAR_CONFIG,
  TIMEOUT_ERROR_MESSAGE
} from '@store/consts/static'
import {
  createLoaderKey,
  ensureApprovalDenied,
  ensureError,
  extractErrorCode,
  extractRuntimeErrorCode,
  mapErrorCodeToMessage
} from '@utils/utils'
import { closeSnackbar } from 'notistack'
import { IncreaseLimitOrderLiquidity } from '@invariant-labs/sdk-eclipse/lib/market'
import { actions as connectionActions, RpcStatus } from '@store/reducers/solanaConnection'

export function* handleGetOrderBook(action: PayloadAction<AddOrderPayload>) {
  try {
    const networkType = yield* select(network)
    const wallet = yield* call(getWallet)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const { pair } = action.payload

    const orderBook = yield* call([marketProgram, marketProgram.getOrderBook], pair)

    yield* put(actions.setOrderBook(orderBook))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
  }
}

export function* handleGetUserOrders() {
  try {
    const networkType = yield* select(network)
    const wallet = yield* call(getWallet)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const userOrders = yield* call(
      [marketProgram, marketProgram.getLimitOrdersByUser],
      wallet.publicKey
    )

    console.log(userOrders)
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
  }
}

export function* handleAddLimitOrder(action: PayloadAction<IncreaseLimitOrderLiquidity>) {
  const loaderAddOrder = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const networkType = yield* select(network)
    const wallet = yield* call(getWallet)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const connection = yield* call(getConnection)
    console.log(action.payload)

    yield put(
      snackbarsActions.add({
        message: 'Adding Limit Order...',
        variant: 'pending',
        persist: true,
        key: loaderAddOrder
      })
    )

    const { tx, additionalSigners } = yield* call(
      [marketProgram, marketProgram.increaseLimitOrderLiquidityTx],
      {
        ...action.payload
      }
    )

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])
    tx.recentBlockhash = blockhash
    tx.lastValidBlockHeight = lastValidBlockHeight
    tx.feePayer = wallet.publicKey

    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    if (additionalSigners.length) {
      tx.partialSign(...additionalSigners)
    }

    const signedTx = (yield* call([wallet, wallet.signTransaction], tx)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    console.log(marketProgram.program.programId.toString())

    const txid = yield* call(sendAndConfirmRawTransaction, connection, signedTx.serialize(), {
      skipPreflight: false
    })

    console.log(txid)

    if (!txid.length) {
      yield put(
        snackbarsActions.add({
          message: 'Adding limit order failed. Please try again',
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
            yield put(actions.setOrderSuccess(false))

            closeSnackbar(loaderAddOrder)
            yield put(snackbarsActions.remove(loaderAddOrder))
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
            message: 'Limit order added',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        console.log(meta)
        // if (meta?.innerInstructions) {
        //   try {
        //     const tokenIn =
        //       allTokens[isXtoY ? swapPool.tokenX.toString() : swapPool.tokenY.toString()]
        //     const tokenOut =
        //       allTokens[isXtoY ? swapPool.tokenY.toString() : swapPool.tokenX.toString()]

        //     const amountIn = getAmountFromSwapInstruction(
        //       meta,
        //       marketProgram.programAuthority.address.toString(),
        //       tokenIn.address.toString(),
        //       SwapTokenType.TokenIn
        //     )
        //     const amountOut = getAmountFromSwapInstruction(
        //       meta,
        //       marketProgram.programAuthority.address.toString(),
        //       tokenOut.address.toString(),
        //       SwapTokenType.TokenOut
        //     )

        //     let points = new BN(0)
        //     try {
        //       if (
        //         leaderboardConfig.swapPairs.some(
        //           item =>
        //             (new PublicKey(item.tokenX).equals(swapPool.tokenX) &&
        //               new PublicKey(item.tokenY).equals(swapPool.tokenY)) ||
        //             (new PublicKey(item.tokenX).equals(swapPool.tokenY) &&
        //               new PublicKey(item.tokenY).equals(swapPool.tokenX))
        //         )
        //       ) {
        //         const feed = feeds[tokenFrom.toString()]

        //         if (feed && feed.price) {
        //           points = calculatePoints(
        //             new BN(amountIn),
        //             tokenIn.decimals,
        //             swapPool.fee,
        //             feed.price,
        //             feed.priceDecimals,
        //             new BN(leaderboardConfig.pointsPerUsd, 'hex')
        //           ).muln(Number(leaderboardConfig.swapMultiplier))
        //         }
        //       }
        //     } catch {
        //       // Sanity check in case some leaderboard config is missing
        //     }

        //     yield put(
        //       snackbarsActions.add({
        //         tokensDetails: {
        //           ikonType: 'swap',
        //           tokenXAmount: formatNumberWithoutSuffix(printBN(amountIn, tokenIn.decimals)),
        //           tokenYAmount: formatNumberWithoutSuffix(printBN(amountOut, tokenOut.decimals)),
        //           tokenXIcon: tokenIn.logoURI,
        //           tokenYIcon: tokenOut.logoURI,
        //           tokenXSymbol: tokenIn.symbol ?? tokenIn.address.toString(),
        //           tokenYSymbol: tokenOut.symbol ?? tokenOut.address.toString(),
        //           earnedPoints: points.eqn(0)
        //             ? undefined
        //             : formatNumberWithoutSuffix(printBN(points, LEADERBOARD_DECIMAL))
        //         },
        //         persist: false
        //       })
        //     )
        //   } catch {
        //     // Sanity wrapper, should never be triggered
        //   }
        // }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'Limit order added',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }
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

    closeSnackbar(loaderAddOrder)
    // yield put(actions.setShouldDisable(false))

    yield put(snackbarsActions.remove(loaderAddOrder))
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
      yield put(connectionActions.setRpcStatus(RpcStatus.Error))
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

export function* orderBookHandler(): Generator {
  yield* takeLatest(actions.getOrderBook, handleGetOrderBook)
}

export function* addLimitOrderHandler(): Generator {
  yield* takeLatest(actions.addLimitOrder, handleAddLimitOrder)
}

export function* userOrdersHandler(): Generator {
  yield* takeLatest(actions.getUserOrders, handleGetUserOrders)
}

export function* orderBookSagas(): Generator {
  yield all([orderBookHandler, userOrdersHandler, addLimitOrderHandler].map(spawn))
}
