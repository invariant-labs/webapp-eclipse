import createSagaMiddleware from 'redux-saga'
import { configureStore, isPlain } from '@reduxjs/toolkit'
import combinedReducers from './reducers'
import rootSaga from './sagas'

const isLocalhost = window.location.hostname === 'localhost'

const isSerializable = (value: unknown) => {
  return typeof value === 'bigint' || isPlain(value)
}

const getEntries = (value: unknown) => {
  return typeof value === 'bigint'
    ? [['bigint', value.toString()] as [string, unknown]]
    : Object.entries(value as Record<string, unknown>)
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
          ignoredActions: ['positions/closePosition', 'pools/setTickMaps']
        }
      }).concat(middleware),
    preloadedState: initialState,
    devTools: isLocalhost
      ? {
          serialize: {
            replacer: (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
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
