import { call, put, select, takeEvery } from 'typed-redux-saga'
import { network } from '@store/selectors/solanaConnection'
import { PublicKey } from '@solana/web3.js'
import { handleRpcError } from './connection'
import { actions } from '@store/reducers/leaderboard'
import { getWallet } from './wallet'
import { PayloadAction } from '@reduxjs/toolkit'

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
  return response.json()
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
            address: new PublicKey(leaderboardData.user.address)
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

export function* leaderboardHandler(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}

export function* leaderboardSaga(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}
