import createSagaMiddleware from 'redux-saga'
import { configureStore, isPlain } from '@reduxjs/toolkit'
import combinedReducers from './reducers'
import rootSaga from './sagas'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { Pair } from '@invariant-labs/sdk-eclipse'

const isLocalhost = window.location.hostname === 'localhost'

const isSerializable = (value: unknown) => {
  return (
    typeof value === 'bigint' ||
    isPlain(value) ||
    value instanceof PublicKey ||
    value instanceof BN ||
    value instanceof Pair
  )
}

const getEntries = (value: unknown) => {
  if (typeof value === 'bigint') {
    return [['bigint', value.toString()]] as [string, unknown][]
  }

  if (value instanceof PublicKey) {
    return [['PublicKey', (value as PublicKey).toBase58()]] as [string, unknown][]
  }

  if (value instanceof BN) {
    return [['BN', (value as BN).toString()]] as [string, unknown][]
  }

  if (value instanceof Pair) {
    return [
      ['tokenX', value.tokenX.toBase58()],
      ['tokenY', value.tokenY.toBase58()],
      [
        'feeTier',
        {
          fee: value.feeTier.fee.toString(),
          tickSpacing: value.feeTier.tickSpacing
        }
      ],
      ['feeTierAddress', value.feeTierAddress ? value.feeTierAddress.toBase58() : null],
      ['tickSpacing', value.tickSpacing]
    ] as [string, unknown][]
  }

  return Object.entries(value as Record<string, unknown>)
}
const configureAppStore = (initialState = {}) => {
  const reduxSagaMonitorOptions = {}
  const sagaMiddleware = createSagaMiddleware(reduxSagaMonitorOptions)

  const middleware = [sagaMiddleware]

  const store = configureStore({
    reducer: combinedReducers,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable,
          getEntries,
          ignoredActions: [
            'positions/closePosition',
            'pools/setTickMaps',
            'pools/getPoolData',
            'pools/getAutoSwapPoolData',
            'solanaConnection/handleRpcError'
          ]
        }
      }).concat(middleware),
    preloadedState: initialState,
    devTools: isLocalhost
      ? {
          serialize: {
            replacer: (_key, value) =>
              typeof value === 'bigint'
                ? value.toString()
                : value instanceof PublicKey
                  ? (value as PublicKey).toBase58()
                  : value instanceof BN
                    ? (value as BN).toString()
                    : value,
            options: true
          }
        }
      : false
  })

  sagaMiddleware.run(rootSaga)
  return store
}

export const store = configureAppStore()

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
