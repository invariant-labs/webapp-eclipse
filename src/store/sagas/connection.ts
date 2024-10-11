import { all, call, put, SagaGenerator, select, takeLeading, spawn, delay } from 'typed-redux-saga'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { Connection } from '@solana/web3.js'
import { PayloadAction } from '@reduxjs/toolkit'
import { rpcAddress, rpcStatus } from '@store/selectors/solanaConnection'
import { getSolanaConnection } from '@utils/web3/connection'
import { actions, RpcStatus, Status } from '@store/reducers/solanaConnection'
import { NetworkType } from '@store/consts/static'

export function* handleRpcError(_action: PayloadAction): Generator {
  const currentRpcStatus = yield* select(rpcStatus)

  if (currentRpcStatus === RpcStatus.Uninitialized) {
    yield* put(actions.setRpcStatus(RpcStatus.Error))
  } else if (currentRpcStatus === RpcStatus.Ignored) {
    yield* put(actions.setRpcStatus(RpcStatus.IgnoredWithError))
  }
}

export function* getConnection(): SagaGenerator<Connection> {
  const rpc = yield* select(rpcAddress)
  const connection = yield* call(getSolanaConnection, rpc)
  return connection
}

export function* initConnection(): Generator {
  try {
    yield* call(getConnection)

    yield* put(
      snackbarsActions.add({
        message: 'Eclipse network connected.',
        variant: 'success',
        persist: false
      })
    )
    yield* put(actions.setStatus(Status.Initialized))
  } catch (error) {
    console.log(error)
    yield* put(actions.setStatus(Status.Error))
    yield put(
      snackbarsActions.add({
        message: 'Failed to connect to Eclipse network',
        variant: 'error',
        persist: false
      })
    )
  }
}

export function* handleNetworkChange(action: PayloadAction<NetworkType>): Generator {
  // yield* delay(1000)
  // window.location.reload()
  yield* put(
    snackbarsActions.add({
      message: `You are on network ${action.payload}`,
      variant: 'info',
      persist: false
    })
  )

  localStorage.setItem('INVARIANT_NETWORK_ECLIPSE', action.payload)
  window.location.reload()
}

export function* updateSlot(): Generator {
  const connection = yield* call(getConnection)
  const slot = yield* call([connection, connection.getSlot])
  yield* put(actions.setSlot(slot))
}

export function* updateSlotSaga(): Generator {
  yield takeLeading(actions.updateSlot, updateSlot)
}

export function* networkChangeSaga(): Generator {
  yield takeLeading(actions.setNetwork, handleNetworkChange)
}
export function* initConnectionSaga(): Generator {
  yield takeLeading(actions.initSolanaConnection, initConnection)
}

export function* handleRpcErrorSaga(): Generator {
  yield takeLeading(actions.handleRpcError, handleRpcError)
}

export function* connectionSaga(): Generator {
  yield* all([networkChangeSaga, initConnectionSaga, updateSlotSaga, handleRpcError].map(spawn))
}
