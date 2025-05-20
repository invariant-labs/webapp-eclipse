import { all, spawn } from 'redux-saga/effects'
import { connectionSaga } from './connection'
import { poolsSaga } from './pool'
import { swapSaga } from './swap'
import { walletSaga } from './wallet'
import { positionsSaga } from './positions'
import { statsHandler, intervalStatsHandler } from './stats'
import { creatorSaga } from './creator'
import { lockerSaga } from './locker'
import { leaderboardSaga } from './leaderboard'

export function* rootSaga(): Generator {
  yield all(
    [
      connectionSaga,
      walletSaga,
      swapSaga,
      positionsSaga,
      poolsSaga,
      statsHandler,
      intervalStatsHandler,
      creatorSaga,
      leaderboardSaga,
      lockerSaga
    ].map(spawn)
  )
}
export default rootSaga
