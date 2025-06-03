import { actions, LockPositionPayload } from '@store/reducers/locker'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { getWallet } from './wallet'
import { sendAndConfirmRawTransaction, SendTransactionError, Transaction } from '@solana/web3.js'
import { getLockerProgram, getMarketProgram } from '@utils/web3/programs/amm'
import { rpcAddress } from '@store/selectors/solanaConnection'
import { getConnection } from './connection'
import { getMaxLockDuration, ILockPositionIx } from '@invariant-labs/locker-eclipse-sdk'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { PayloadAction } from '@reduxjs/toolkit'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as positionsActions } from '@store/reducers/positions'
import {
  APPROVAL_DENIED_MESSAGE,
  COMMON_ERROR_MESSAGE,
  DEFAULT_PUBLICKEY,
  SIGNING_SNACKBAR_CONFIG
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

export function* handleLockPosition(action: PayloadAction<LockPositionPayload>) {
  const { index, network } = action.payload

  const loaderLockPosition = createLoaderKey()
  const loaderSigningTx = createLoaderKey()
  try {
    const connection = yield* call(getConnection)
    const wallet = yield* call(getWallet)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, network, rpc, wallet as IWallet)
    const locker = yield* call(getLockerProgram, network, rpc, wallet as IWallet)
    yield put(positionsActions.setShouldDisable(true))

    if (wallet.publicKey.toBase58() === DEFAULT_PUBLICKEY.toBase58() || !connection) {
      yield put(
        snackbarsActions.add({
          message: 'Failed to lock position',
          variant: 'error',
          persist: false
        })
      )
      throw new Error('Wallet not connected')
    }
    yield put(
      snackbarsActions.add({
        message: 'Locking position...',
        variant: 'pending',
        persist: true,
        key: loaderLockPosition
      })
    )
    yield put(snackbarsActions.add({ ...SIGNING_SNACKBAR_CONFIG, key: loaderSigningTx }))

    const lockData: ILockPositionIx = {
      lockDuration: getMaxLockDuration(),
      market: marketProgram as any,
      index: index
    }
    const ixs = yield* call([locker, locker.lockPositionIx], lockData, wallet.publicKey)

    const transaction = new Transaction().add(...ixs)

    const { blockhash, lastValidBlockHeight } = yield* call([
      connection,
      connection.getLatestBlockhash
    ])

    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    const signedTx = (yield* call([wallet, wallet.signTransaction], transaction)) as Transaction

    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))

    const signatureTx = yield* call(
      sendAndConfirmRawTransaction,
      connection,
      signedTx.serialize(),
      {
        skipPreflight: false
      }
    )

    const confirmedTx = yield* call([connection, connection.confirmTransaction], {
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: signatureTx
    })

    closeSnackbar(loaderLockPosition)
    yield put(snackbarsActions.remove(loaderLockPosition))

    if (confirmedTx.value.err === null) {
      yield* put(actions.setLockSuccess(true))
      yield* put(positionsActions.getPositionsList())

      yield put(
        snackbarsActions.add({
          message: 'Position locked successfully',
          variant: 'success',
          persist: false,
          txid: signatureTx
        })
      )
      return
    }
    yield put(actions.setLockSuccess(false))
    yield put(positionsActions.setShouldDisable(false))
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

    yield put(positionsActions.setShouldDisable(false))
    yield put(actions.setLockSuccess(false))
    closeSnackbar(loaderLockPosition)
    yield put(snackbarsActions.remove(loaderLockPosition))
    closeSnackbar(loaderSigningTx)
    yield put(snackbarsActions.remove(loaderSigningTx))
    yield put(
      snackbarsActions.add({
        message: msg,
        variant: 'error',
        persist: false
      })
    )
  }
}

export function* lockerHandler(): Generator {
  yield* takeLatest(actions.lockPosition, handleLockPosition)
}

export function* lockerSaga(): Generator {
  yield all([lockerHandler].map(spawn))
}
