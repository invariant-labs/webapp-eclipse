import { all, spawn } from 'redux-saga/effects'
import { connectionSaga } from './connection'
import { poolsSaga } from './pool'
import { swapSaga } from './swap'
import { walletSaga } from './wallet'
import { positionsSaga } from './positions'
import { statsSaga } from './stats'
import { creatorSaga } from './creator'
import { lockerSaga } from './locker'
import { leaderboardSaga } from './leaderboard'
import { stakeSaga } from './sBitz'

export function* rootSaga(): Generator {
  yield all(
    [
      connectionSaga,
      walletSaga,
      swapSaga,
      positionsSaga,
      poolsSaga,
      statsSaga,
      creatorSaga,
      leaderboardSaga,
      lockerSaga,
      stakeSaga
    ].map(spawn)
  )
}
export default rootSaga
