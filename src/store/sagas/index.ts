import { all, spawn } from 'redux-saga/effects'
import { connectionSaga } from './connection'
import { poolsSaga } from './pool'
import { swapSaga } from './swap'
import { walletSaga } from './wallet'
import { positionsSaga } from './positions'
import { statsHandler } from './stats'
import { creatorSaga } from './creator'
import { lockerSaga } from './locker'
import { leaderboardSaga } from './leaderboard'
import { saleSaga } from './sale'

export function* rootSaga(): Generator {
  yield all(
    [
      connectionSaga,
      walletSaga,
      swapSaga,
      positionsSaga,
      poolsSaga,
      statsHandler,
      creatorSaga,
      leaderboardSaga,
      lockerSaga,
      saleSaga
    ].map(spawn)
  )
}
export default rootSaga
