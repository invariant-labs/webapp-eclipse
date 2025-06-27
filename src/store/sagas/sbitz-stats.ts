import { actions } from '@store/reducers/sbitz-stats'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { handleRpcError } from './connection'
import { ensureError, fetchStackedBitzStats } from '@utils/utils'
import { lastTimestamp } from '@store/selectors/sbitz-stats'
import { STATS_CACHE_TIME } from '@store/consts/static'

export function* getStackedBitzStats(): Generator {
  try {
    const lastFetchTimestamp = yield* select(lastTimestamp)

    if (+Date.now() < lastFetchTimestamp + STATS_CACHE_TIME) {
      return yield* put(actions.setLoadingStats(false))
    }

    const fullSnap = yield* call(fetchStackedBitzStats)
    console.log(fullSnap)
    yield* put(actions.setCurrentStats(fullSnap))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLoadingStats(false))

    yield* call(handleRpcError, error.message)
  }
}

export function* stackedBitzStatsHandler(): Generator {
  yield* takeLatest(actions.getCurrentStats, getStackedBitzStats)
}

export function* sbitzStatsSaga(): Generator {
  yield* all([stackedBitzStatsHandler].map(spawn))
}
