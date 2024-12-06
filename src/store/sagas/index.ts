import { all, spawn } from 'redux-saga/effects'
import { connectionSaga } from './connection'
import { poolsSaga } from './pool'
import { swapHandler } from './swap'
import { walletSaga } from './wallet'
import { positionsSaga } from './positions'
import { statsHandler } from './stats'
import { creatorSaga } from './creator'
import { lockerSaga } from './locker'
// import { farmsSaga } from './farms'
// import { bondsSaga } from './bonds'

export function* rootSaga(): Generator {
  yield all(
    [
      connectionSaga,
      walletSaga,
      swapHandler,
      positionsSaga,
      poolsSaga,
      statsHandler,
      creatorSaga,
      lockerSaga
      // bondsSaga,
      // farmsSaga
    ].map(spawn)
  )
}
export default rootSaga
