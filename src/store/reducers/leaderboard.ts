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
  top3Scorers: LeaderboardEntry[]
  isLoading: boolean
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

export const defaultState: ILeaderboardStore = {
  currentUser: null,
  leaderboard: [],
  top3Scorers: [],
  isLoading: false,
  currentPage: 1,
  totalItems: 0,
  itemsPerPage: 25
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
        totalItems: number
      }>
    ) {
      state.currentUser = action.payload.user
      state.leaderboard = action.payload.leaderboard
      state.totalItems = action.payload.totalItems
      state.isLoading = false
      if (state.currentPage === 1) {
        state.top3Scorers = action.payload.leaderboard
          .filter(entry => entry.rank <= 3)
          .sort((a, b) => a.rank - b.rank)
      }
      return state
    },
    getLeaderboardData(state, action: PayloadAction<{ page: number; itemsPerPage: number }>) {
      state.isLoading = true
      state.currentPage = action.payload.page
      return state
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload
      return state
    },
    setLoadingState(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      return state
    }
    //   updateUserStats(state, action: PayloadAction<UserStats>) {
    //     state.currentUser = action.payload
    //     const userIndex = state.leaderboard.findIndex(
    //       entry => entry.address === action.payload.address
    //     )
    //     if (userIndex !== -1) {
    //       state.leaderboard[userIndex] = action.payload

    //       if (action.payload.rank <= 3) {
    //         const existingTop3Index = state.top3Scorers.findIndex(
    //           entry => entry.address === action.payload.address
    //         )

    //         if (existingTop3Index !== -1) {
    //           state.top3Scorers[existingTop3Index] = action.payload
    //         } else {
    //           state.top3Scorers = [...state.top3Scorers, action.payload]
    //             .sort((a, b) => a.rank - b.rank)
    //             .slice(0, 3)
    //         }
    //       } else {
    //         state.top3Scorers = state.top3Scorers.filter(
    //           entry => entry.address !== action.payload.address
    //         )
    //       }
    //     }
    //     return state
    //   }
  }
})

export const actions = leaderboardSlice.actions
export const reducer = leaderboardSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>