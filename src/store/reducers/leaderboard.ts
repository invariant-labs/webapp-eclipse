import { BN } from '@coral-xyz/anchor'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'

export interface UserStats {
  points: BN
  positions: number
  last24hPoints: BN
  rank: number
  address: PublicKey
}

export interface LeaderboardEntry extends UserStats {}

export interface ILeaderboardStore {
  currentUser: UserStats | null
  leaderboard: LeaderboardEntry[]
  isLoading: boolean
}

export const defaultState: ILeaderboardStore = {
  currentUser: null,
  leaderboard: [],
  isLoading: false
}

export const leaderboardSliceName = 'leaderboard'

const leaderboardSlice = createSlice({
  name: leaderboardSliceName,
  initialState: defaultState,
  reducers: {
    setLeaderboardData(
      state,
      action: PayloadAction<{
        user: UserStats
        leaderboard: LeaderboardEntry[]
      }>
    ) {
      state.currentUser = action.payload.user
      state.leaderboard = action.payload.leaderboard
      state.isLoading = false
      return state
    },
    getLeaderboardData(state) {
      state.isLoading = true
      return state
    },
    setLoadingState(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      return state
    },
    updateUserStats(state, action: PayloadAction<UserStats>) {
      state.currentUser = action.payload
      const userIndex = state.leaderboard.findIndex(
        entry => entry.address === action.payload.address
      )
      if (userIndex !== -1) {
        state.leaderboard[userIndex] = action.payload
      }
      return state
    }
  }
})

export const actions = leaderboardSlice.actions
export const reducer = leaderboardSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
