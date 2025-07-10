import { all, call, put, select, spawn, takeEvery } from 'typed-redux-saga'
import { network } from '@store/selectors/solanaConnection'
import { handleRpcError } from './connection'
import { actions, ILpEntry, ISwapEntry, ITotalEntry } from '@store/reducers/leaderboard'
import { getWallet } from './wallet'
import { PayloadAction } from '@reduxjs/toolkit'
import { ensureError } from '@utils/utils'
import { LEADERBOARD_API_URL } from '@store/consts/static'

export interface IPromotedPool {
  address: string
  pointsPerSecond: string
  startCountTimestamp: string
}
interface ILpLeaderboardResponse {
  user: ILpEntry | null
  leaderboard: ILpEntry[]
  totalItems: number
}
interface ISwapLeaderboardResponse {
  user: ISwapEntry | null
  leaderboard: ISwapEntry[]
  totalItems: number
}
interface ITotalLeaderboardResponse {
  user: ITotalEntry | null
  leaderboard: ITotalEntry[]
  totalItems: number
}
// interface IConfigResponse {
//   refreshTime: number
//   pointsDecimal: number
//   promotedPools: IPromotedPool[]
//   pointsPerUSD: number
//   lastSnapTimestamp: string
//   swapPairs: { tokenX: string; tokenY: string }[]
//   swapMultiplier: string
//   contentProgramDateStart: string
//   contentProgramDateEnd: string
// }
interface IFetchContentPointsResponse {
  startTimestamp: number
  endTimestamp: number
  points: number
}

async function fetchLpLeaderboardData(
  network: string,
  userWallet?: string,
  page: number = 1,
  itemsPerPage: number = 25
) {
  const offset = (page - 1) * itemsPerPage
  const response = await fetch(
    `${LEADERBOARD_API_URL}/eclipse-${network}/lp/${userWallet}?offset=${offset}&size=${itemsPerPage}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as Promise<ILpLeaderboardResponse>
}
async function fetchContentPoints(userWallet?: string) {
  const response = await fetch(`${LEADERBOARD_API_URL}/content-program/${userWallet}`)
  if (!response.ok) {
    throw new Error('Failed to fetch content points')
  }
  return response.json() as Promise<IFetchContentPointsResponse[] | null>
}

async function fetchSwapLeaderboardData(
  network: string,
  userWallet?: string,
  page: number = 1,
  itemsPerPage: number = 25
) {
  const offset = (page - 1) * itemsPerPage
  const response = await fetch(
    `${LEADERBOARD_API_URL}/eclipse-${network}/swaps/${userWallet}?offset=${offset}&size=${itemsPerPage}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as Promise<ISwapLeaderboardResponse>
}
async function fetchTotalLeaderboardData(
  network: string,
  userWallet?: string,
  page: number = 1,
  itemsPerPage: number = 25
) {
  const offset = (page - 1) * itemsPerPage
  const response = await fetch(
    `${LEADERBOARD_API_URL}/eclipse-${network}/total/${userWallet}?offset=${offset}&size=${itemsPerPage}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as Promise<ITotalLeaderboardResponse>
}
async function fetchLeaderboardConfig() {
  const response = await fetch(`${LEADERBOARD_API_URL}/config`)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  const data = {
    refreshTime: 1800,
    pointsDecimal: 8,
    promotedPools: [
      {
        address: '6ciuuX2AZ3RFU6fJh2XrzJurZdRWuDeMonNsb7xzztp1',
        pointsPerSecond: '64',
        startCountTimestamp: '6766d8da'
      },
      {
        address: '8gSs6K4NVZSh4Rd5ABcNTos5sJ6wVRTR4xr5LgNLMt58',
        pointsPerSecond: '64',
        startCountTimestamp: '6766d8da'
      },
      {
        address: 'HRgVv1pyBLXdsAddq4ubSqo8xdQWRrYbvmXqEDtectce',
        pointsPerSecond: '64',
        startCountTimestamp: '6766d8da'
      },
      {
        address: '9RkzLPufg9RVxRLXZx1drZvf1gXLwgffnhW9oFJSstad',
        pointsPerSecond: '46',
        startCountTimestamp: '00'
      },
      {
        address: 'HG7iQMk29cgs74ZhSwrnye3C6SLQwKnfsbXqJVRi1x8H',
        pointsPerSecond: '28',
        startCountTimestamp: '67fcd284'
      },
      {
        address: '86vPh8ctgeQnnn8qPADy5BkzrqoH5XjMCWvkd4tYhhmM',
        pointsPerSecond: '1e',
        startCountTimestamp: '67c03de0'
      },
      {
        address: 'E2B7KUFwjxrsy9cC17hmadPsxWHD1NufZXTyrtuz8YxC',
        pointsPerSecond: '19',
        startCountTimestamp: '67ce0183'
      },
      {
        address: 'FvVsbwsbGVo6PVfimkkPhpcRfBrRitiV946nMNNuz7f9',
        pointsPerSecond: '0a',
        startCountTimestamp: '6772f81b'
      },
      {
        address: '1Zxv7bYYzMuK8eey85ZSowa24S8B7QNfDx3GQpKQ4Bf',
        pointsPerSecond: '06',
        startCountTimestamp: '6772f81b'
      }
    ],
    lastSnapTimestamp: 1752145095,
    pointsPerUSD: 'c8',
    swapMultiplier: '01',
    swapPairs: [
      {
        tokenX: 'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE',
        tokenY: 'So11111111111111111111111111111111111111112'
      },
      {
        tokenX: 'GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn',
        tokenY: 'So11111111111111111111111111111111111111112'
      },
      {
        tokenX: 'BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL',
        tokenY: 'So11111111111111111111111111111111111111112'
      },
      {
        tokenX: 'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE',
        tokenY: 'BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL'
      },
      {
        tokenX: 'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE',
        tokenY: '27Kkn8PWJbKJsRZrxbsYDdedpUQKnJ5vNfserCxNEJ3R'
      }
    ],
    contentProgramDateStart: '1.07.2025',
    contentProgramDateEnd: '14.07.2025'
  }
  return data
  //   return response.json() as Promise<IConfigResponse>
}
async function fetchLeaderboardPriceFeed() {
  const response = await fetch(`${LEADERBOARD_API_URL}/swap/price-feeds`)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json()
}

export function* getContentPoints(): Generator {
  try {
    const wallet = yield* call(getWallet)
    const contentPoints: IFetchContentPointsResponse[] | null = yield* call(
      fetchContentPoints,
      wallet?.publicKey?.toString()
    )
    yield* put(actions.setContentPoints(contentPoints))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
    yield* put(actions.setContentPoints(null))
  }
}

export function* getLeaderboard(
  action: PayloadAction<{ page: number; itemsPerPage: number }>
): Generator {
  try {
    const currentNetwork = yield* select(network)
    const wallet = yield* call(getWallet)
    const { page, itemsPerPage } = action.payload

    const leaderboardLpData: ILpLeaderboardResponse = yield* call(
      fetchLpLeaderboardData,
      currentNetwork.toLowerCase(),
      wallet?.publicKey?.toString() ?? null,
      page,
      itemsPerPage
    )

    yield* put(actions.setLpLeaderboardData(leaderboardLpData))
    const leaderboardSwapData: ISwapLeaderboardResponse = yield* call(
      fetchSwapLeaderboardData,
      currentNetwork.toLowerCase(),
      wallet?.publicKey?.toString() ?? null,
      page,
      itemsPerPage
    )
    yield* put(actions.setSwapLeaderboardData(leaderboardSwapData))
    const leaderboardTotalData: ITotalLeaderboardResponse = yield* call(
      fetchTotalLeaderboardData,
      currentNetwork.toLowerCase(),
      wallet?.publicKey?.toString() ?? null,
      page,
      itemsPerPage
    )

    yield* put(actions.setTotalLeaderboardData(leaderboardTotalData))

    yield* put(actions.setLoadingState(false))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLoadingState(false))
    yield* call(handleRpcError, error.message)
  }
}

export function* getLeaderboardConfig(): Generator {
  try {
    const {
      pointsDecimal,
      refreshTime,
      promotedPools,
      lastSnapTimestamp,
      pointsPerUSD,
      swapPairs,
      swapMultiplier,
      contentProgramDateStart,
      contentProgramDateEnd
    } = yield* call(fetchLeaderboardConfig)

    const priceFeeds = yield* call(fetchLeaderboardPriceFeed)
    yield* put(
      actions.setLeaderboardConfig({
        pointsDecimal,
        refreshTime,
        promotedPools,
        // @ts-expect-error tmp fix
        lastSnapTimestamp,
        // @ts-expect-error tmp fix
        pointsPerUSD,
        swapPairs,
        swapMultiplier,
        contentProgramDateStart,
        contentProgramDateEnd
      })
    )

    yield* put(actions.setLeaderboardPriceFeeds(priceFeeds))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)
  }
}

export function* leaderboardHandler(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}

export function* leaderboardContentPoints(): Generator {
  yield* takeEvery(actions.getContentPointsRequest.type, getContentPoints)
}
export function* leaderboardConfig(): Generator {
  yield* takeEvery(actions.getLeaderboardConfig, getLeaderboardConfig)
}

export function* leaderboardSaga(): Generator {
  yield all([leaderboardHandler, leaderboardConfig, leaderboardContentPoints].map(spawn))
}
