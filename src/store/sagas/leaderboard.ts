import { call, put, select, takeEvery } from 'typed-redux-saga'
import { network } from '@store/selectors/solanaConnection'
import { PublicKey } from '@solana/web3.js'
import { handleRpcError } from './connection'
import { actions } from '@store/reducers/leaderboard'
import { getWallet } from './wallet'

async function fetchLeaderboardData(network: string, userWallet?: string) {
  const response = await fetch(`https://points.invariant.app/api/eclipse-${network}/${userWallet}`)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json()
}

export function* getLeaderboard(): Generator {
  try {
    const currentNetwork = yield* select(network)
    const wallet = yield* call(getWallet)
    const leaderboardData = yield* call(
      fetchLeaderboardData,
      currentNetwork.toLowerCase(),
      wallet?.publicKey?.toString() ?? null
    )
    console.log(leaderboardData)
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
      }))
    }

    yield* put(actions.setLeaderboardData(parsedData))
  } catch (error) {
    yield* put(actions.setLoadingState(false))
    console.log(error)

    yield* call(handleRpcError, (error as Error).message)
  }
}

// export function* updateUserStatsFlow(userAddress: string): Generator {
//   try {
//     const currentNetwork = yield* select(network)

//     const userData = yield* call(async () => {
//       const response = await fetch(`/api/${currentNetwork}/user/${userAddress}`)
//       if (!response.ok) {
//         throw new Error('Failed to fetch user stats')
//       }
//       return response.json()
//     })

//     yield* put(actions.updateUserStats(userData))
//   } catch (error) {
//     console.log(error)
//     yield* call(handleRpcError, (error as Error).message)
//   }
// }

export function* leaderboardHandler(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}

export function* leaderboardSaga(): Generator {
  yield* takeEvery(actions.getLeaderboardData, getLeaderboard)
}
