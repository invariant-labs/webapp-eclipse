import { all, call, put, select, spawn, takeEvery } from 'typed-redux-saga'
import { network } from '@store/selectors/solanaConnection'
import { handleRpcError } from './connection'
import { actions, UserStats } from '@store/reducers/leaderboard'
import { getWallet } from './wallet'
import { PayloadAction } from '@reduxjs/toolkit'
interface IResponse {
  user: UserStats | null
  leaderboard: UserStats[]
  totalItems: number
}
export interface IPromotedPoolsResponse {
  address: string
  pointsPerSecond: string
}
export interface IConfigResponse {
  refreshTime: number
  pointsDecimal: number
  promotedPools: IPromotedPoolsResponse[]
}
async function fetchLeaderboardData(
  network: string,
  userWallet?: string,
  page: number = 1,
  itemsPerPage: number = 25
) {
  const offset = (page - 1) * itemsPerPage
  const response = await fetch(
    `https://points.invariant.app/api/eclipse-${network}/${userWallet}?offset=${offset}&size=${itemsPerPage}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as Promise<IResponse>
}
async function fetchLeaderboardConfig() {
  const response = await fetch(`https://points.invariant.app/api/config`)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as Promise<IConfigResponse>
}
export function* getLeaderboard(
  action: PayloadAction<{ page: number; itemsPerPage: number }>
): Generator {
  try {
    const currentNetwork = yield* select(network)
    const wallet = yield* call(getWallet)
    const { page, itemsPerPage } = action.payload

    const leaderboardData = yield* call(
      fetchLeaderboardData,
      currentNetwork.toLowerCase(),
      wallet?.publicKey?.toString() ?? null,
      page,
      itemsPerPage
    )

    const parsedData = {
      user: leaderboardData.user
        ? {
            ...leaderboardData.user,
            address: leaderboardData.user.address
          }
        : null,

      leaderboard: leaderboardData.leaderboard.map((entry: any) => ({
        ...entry,
        address: entry.address
      })),
      totalItems: leaderboardData.totalItems
    }

    yield* put(actions.setLeaderboardData(parsedData))
  } catch (error) {
    yield* put(actions.setLoadingState(false))
    console.log(error)
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* getLeaderboardConfig(): Generator {
  try {
    const leaderboardConfig = yield* call(fetchLeaderboardConfig)

    yield* put(actions.setLeaderboardConfig(leaderboardConfig))
  } catch (error) {
    console.log(error)
  }
}

export function* leaderboardHandler(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}

export function* leaderboardConfig(): Generator {
  yield* takeEvery(actions.getLeaderboardConfig, getLeaderboardConfig)
}

export function* leaderboardSaga(): Generator {
  yield all([leaderboardHandler, leaderboardConfig].map(spawn))
}
