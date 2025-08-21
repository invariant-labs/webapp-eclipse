import { actions, AddOrderPayload, IRemoveOrder } from '@store/reducers/orderBook'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { createAccount, getWallet } from './wallet'
import {
  Keypair,
  sendAndConfirmRawTransaction,
  SendTransactionError,
  Transaction,
  TransactionExpiredTimeoutError,
  VersionedTransaction
} from '@solana/web3.js'
import { getLockerProgram, getMarketProgram } from '@utils/web3/programs/amm'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getConnection, handleRpcError } from './connection'
import { getMaxLockDuration, ILockPositionIx } from '@invariant-labs/locker-eclipse-sdk'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { PayloadAction } from '@reduxjs/toolkit'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as positionsActions } from '@store/reducers/positions'
import {
  APPROVAL_DENIED_MESSAGE,
  COMMON_ERROR_MESSAGE,
  DEFAULT_PUBLICKEY,
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
  formatNumberWithoutSuffix,
  getAmountFromLimitOrderInstruction,
  getTokenProgramId,
  mapErrorCodeToMessage,
  printBN,
  TokenType
} from '@utils/utils'
import { closeSnackbar } from 'notistack'
import {
  DecreaseLimitOrderLiquidity,
  IncreaseLimitOrderLiquidity
} from '@invariant-labs/sdk-eclipse/lib/market'
import { actions as connectionActions, RpcStatus } from '@store/reducers/solanaConnection'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { tokens } from '@store/selectors/pools'

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

    yield* put(actions.setUserOrders(userOrders))
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
    const allTokens = yield* select(tokens)

    const { pair, amount, owner, tickIndex, xToY } = action.payload
    yield put(
      snackbarsActions.add({
        message: 'Adding Limit Order...',
        variant: 'pending',
        persist: true,
        key: loaderAddOrder
      })
    )

    const tokenXProgramId = yield* call(getTokenProgramId, connection, pair.tokenX)
    const tokenYProgramId = yield* call(getTokenProgramId, connection, pair.tokenY)

    const userTokenXAccount = yield* call(
      getAssociatedTokenAddress,
      pair.tokenX,
      wallet.publicKey,
      undefined,
      tokenXProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const userTokenYAccount = yield* call(
      getAssociatedTokenAddress,
      pair.tokenY,
      wallet.publicKey,
      undefined,
      tokenYProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    console.log(userTokenXAccount.toString())
    console.log(userTokenYAccount.toString())

    const { tx, additionalSigners } = yield* call(
      [marketProgram, marketProgram.increaseLimitOrderLiquidityTx],
      {
        pair,
        owner,
        amount,
        xToY,
        tickIndex,
        userTokenX: userTokenXAccount,
        userTokenY: userTokenYAccount
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
      const userOrders = yield* call(
        [marketProgram, marketProgram.getLimitOrdersByUser],
        wallet.publicKey
      )

      yield* put(actions.setUserOrders(userOrders))

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

        if (meta?.innerInstructions && meta.innerInstructions) {
          try {
            const amountX = getAmountFromLimitOrderInstruction(meta, TokenType.TokenX)
            const amountY = getAmountFromLimitOrderInstruction(meta, TokenType.TokenY)

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
          } catch {
            // Should never be triggered
          }
        }
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

    closeSnackbar(loaderAddOrder)
    yield put(snackbarsActions.remove(loaderAddOrder))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    closeSnackbar(loaderAddOrder)
    yield put(snackbarsActions.remove(loaderAddOrder))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

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

    // yield put(actions.setShouldDisable(false))

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

export function* handleRemoveLimitOrder(action: PayloadAction<IRemoveOrder>) {
  const loaderRemoveOrder = createLoaderKey()
  const loaderSigningTx = createLoaderKey()

  try {
    const networkType = yield* select(network)
    const wallet = yield* call(getWallet)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const connection = yield* call(getConnection)
    const allTokens = yield* select(tokens)

    const { pair, amount, owner, orderKey } = action.payload
    yield put(
      snackbarsActions.add({
        message: 'Closing Limit Order...',
        variant: 'pending',
        persist: true,
        key: loaderRemoveOrder
      })
    )

    const tokenXProgramId = yield* call(getTokenProgramId, connection, pair.tokenX)
    const tokenYProgramId = yield* call(getTokenProgramId, connection, pair.tokenY)

    const userTokenXAccount = yield* call(
      getAssociatedTokenAddress,
      pair.tokenX,
      wallet.publicKey,
      undefined,
      tokenXProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const userTokenYAccount = yield* call(
      getAssociatedTokenAddress,
      pair.tokenY,
      wallet.publicKey,
      undefined,
      tokenYProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const tx = yield* call([marketProgram, marketProgram.decreaseLimitOrderLiquidityTx], {
      pair,
      owner,
      orderKey,
      amount,
      userTokenX: userTokenXAccount,
      userTokenY: userTokenYAccount
    })

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
          message: 'Closing limit order failed. Please try again',
          variant: 'error',
          persist: false,
          txid
        })
      )
    } else {
      const userOrders = yield* call(
        [marketProgram, marketProgram.getLimitOrdersByUser],
        wallet.publicKey
      )

      yield* put(actions.setUserOrders(userOrders))

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

            closeSnackbar(loaderRemoveOrder)
            yield put(snackbarsActions.remove(loaderRemoveOrder))
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
            message: 'Limit order closed',
            variant: 'success',
            persist: false,
            txid
          })
        )

        const meta = txDetails.meta

        if (meta?.innerInstructions && meta.innerInstructions) {
          try {
            const amountX = getAmountFromLimitOrderInstruction(meta, TokenType.TokenX)
            const amountY = getAmountFromLimitOrderInstruction(meta, TokenType.TokenY)

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
          } catch {
            // Should never be triggered
          }
        }
      } else {
        yield put(
          snackbarsActions.add({
            message: 'Limit order closed',
            variant: 'success',
            persist: false,
            txid
          })
        )
      }
    }

    closeSnackbar(loaderRemoveOrder)
    yield put(snackbarsActions.remove(loaderRemoveOrder))
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

    closeSnackbar(loaderRemoveOrder)
    // yield put(actions.setShouldDisable(false))

    yield put(snackbarsActions.remove(loaderRemoveOrder))
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

export function* userOrdersHandler(): Generator {
  yield* takeLatest(actions.getUserOrders, handleGetUserOrders)
}

export function* addLimitOrderHandler(): Generator {
  yield* takeLatest(actions.addLimitOrder, handleAddLimitOrder)
}

export function* removeLimitOrderHandler(): Generator {
  yield* takeLatest(actions.removeLimitOrder, handleRemoveLimitOrder)
}

export function* orderBookSagas(): Generator {
  yield all(
    [orderBookHandler, userOrdersHandler, addLimitOrderHandler, removeLimitOrderHandler].map(spawn)
  )
}
