import { combineReducers } from 'redux'
import storage from 'redux-persist/lib/storage'
import { persistReducer, createTransform, createMigrate, MigrationManifest } from 'redux-persist'
import { reducer as snackbarsReducer, snackbarsSliceName } from './snackbars'
import { reducer as solanaWalletReducer, solanaWalletSliceName } from './solanaWallet'
import {
  ISolanaConnectionStore,
  reducer as solanaConnectionReducer,
  solanaConnectionSliceName
} from './solanaConnection'
import { poolsSliceName, reducer as poolsReducer } from './pools'
import { swapSliceName, reducer as swapReducer } from './swap'
import { positionsSliceName, reducer as positionsReducer } from './positions'
import { statsSliceName, reducer as statsReducer } from './stats'
import { NetworkType } from '@store/consts/static'
import { RPC } from '@utils/web3/connection'
import { reducer as creatorReducer, creatorSliceName } from './creator'
import { reducer as lockerReducer, lockerSliceName } from './locker'
import { reducer as leaderboardReducer, leaderboardSliceName } from './leaderboard'
import { reducer as navigationReducer, navigationSliceName } from './navigation'
import { reducer as sBitzReducer, sBitzSliceName } from './sBitz'
import { sbitzStatsSliceName, reducer as sbitzStatsReducer } from './sbitz-stats'

const transformNetwork = createTransform(
  (inboundState: any, _key) => {
    return inboundState
  },
  (outboundState, key) => {
    if (key === 'network' && !Object.values(NetworkType).includes(outboundState)) {
      return NetworkType.Mainnet
    }

    return outboundState
  }
)

const migrations: MigrationManifest = {
  // @ts-expect-error: Migration function may have undefined state
  1: (state: ISolanaConnectionStore) => {
    const network =
      typeof state?.network !== 'undefined' && Object.values(NetworkType).includes(state.network)
        ? state.network
        : NetworkType.Mainnet

    let rpcAddress

    switch (network) {
      case NetworkType.Devnet:
        rpcAddress = RPC.DEV
        break
      case NetworkType.Testnet:
        rpcAddress = RPC.TEST
        break
      case NetworkType.Local:
        rpcAddress = RPC.LOCAL
        break
      case NetworkType.Mainnet:
        rpcAddress = RPC.MAIN
        break
    }

    return {
      ...state,
      rpcAddress
    }
  }
}

const connectionPersistConfig = {
  key: solanaConnectionSliceName,
  version: 1,
  storage: storage,
  whitelist: ['network', 'rpcAddress'],
  transforms: [transformNetwork],
  migrate: createMigrate(migrations, { debug: false })
}

const combinedReducers = combineReducers({
  [snackbarsSliceName]: snackbarsReducer,
  [solanaConnectionSliceName]: persistReducer(connectionPersistConfig, solanaConnectionReducer),
  [solanaWalletSliceName]: solanaWalletReducer,
  [poolsSliceName]: poolsReducer,
  [swapSliceName]: swapReducer,
  [positionsSliceName]: positionsReducer,
  [statsSliceName]: statsReducer,
  [leaderboardSliceName]: leaderboardReducer,
  [creatorSliceName]: creatorReducer,
  [lockerSliceName]: lockerReducer,
  [navigationSliceName]: navigationReducer,
  [sBitzSliceName]: sBitzReducer,
  [sbitzStatsSliceName]: sbitzStatsReducer
})

export default combinedReducers
