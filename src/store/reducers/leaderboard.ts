import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LeaderBoardType } from '@store/consts/static'
import { PayloadType } from '@store/consts/types'
import { IPromotedPool } from '@store/sagas/leaderboard'

export interface ITotalEntry {
  rank: number
  address: string
  points: string
  swapPoints: string
  lpPoints: string
  last24hPoints: string
  domain?: string
}

export interface ISwapEntry {
  rank: number
  address: string
  points: string
  last24hPoints: string
  swaps: number
  domain?: string
}

export interface ILpEntry {
  rank: number
  address: string
  points: string
  last24hPoints: string
  positions: number
  domain?: string
}

export interface CurrentUser {
  total: ITotalEntry | null
  swap: ISwapEntry | null
  lp: ILpEntry | null
}

export interface LeaderboardUser {
  total: ITotalEntry[]
  swap: ISwapEntry[]
  lp: ILpEntry[]
}

export interface CurrentContentPointsEntry {
  startTimestamp: number
  endTimestamp: number
  points: number
}

export interface ILeaderboardStore {
  type: LeaderBoardType
  currentUser: CurrentUser
  leaderboard: LeaderboardUser
  top3Scorers: LeaderboardUser
  isLoading: boolean
  currentPage: number
  totalItems: {
    total: number
    swap: number
    lp: number
  }
  itemsPerPage: number
  config: {
    refreshTime: number
    pointsDecimal: number
    promotedPools: IPromotedPool[]
    lastSnapTimestamp: string
    pointsPerUsd: number
    swapPairs: { tokenX: string; tokenY: string }[]
    swapMultiplier: string
    contentProgramDateStart: string
    contentProgramDateEnd: string
  }
  priceFeeds: Record<
    string,
    {
      pricePublishTime: number
      priceDecimals: number
      price: string
    }
  >
  contentPoints: CurrentContentPointsEntry[] | null
}

export const defaultState: ILeaderboardStore = {
  type: 'Total',
  currentUser: { total: null, lp: null, swap: null },
  leaderboard: { total: [], lp: [], swap: [] },
  top3Scorers: { total: [], lp: [], swap: [] },
  isLoading: false,
  currentPage: 1,
  totalItems: { total: 0, swap: 0, lp: 0 },
  itemsPerPage: 25,
  config: {
    refreshTime: 0,
    pointsDecimal: 0,
    promotedPools: [],
    swapPairs: [],
    lastSnapTimestamp: '',
    pointsPerUsd: 0,
    swapMultiplier: '01',
    contentProgramDateStart: '01.01.2025',
    contentProgramDateEnd: '31.12.2025'
  },
  priceFeeds: {},
  contentPoints: null
}

export const leaderboardSliceName = 'leaderboard'

const leaderboardSlice = createSlice({
  name: leaderboardSliceName,
  initialState: defaultState,
  reducers: {
    setTotalLeaderboardData(
      state,
      action: PayloadAction<{
        user: ITotalEntry | null
        leaderboard: ITotalEntry[]
        totalItems: number
      }>
    ) {
      state.currentUser.total = action.payload.user
      state.leaderboard.total = action.payload.leaderboard
      state.totalItems.total = action.payload.totalItems
      if (state.currentPage === 1) {
        state.top3Scorers.total = action.payload.leaderboard
          .filter(entry => entry.rank <= 3)
          .sort((a, b) => a.rank - b.rank)
      }
      return state
    },
    setSwapLeaderboardData(
      state,
      action: PayloadAction<{
        user: ISwapEntry | null
        leaderboard: ISwapEntry[]
        totalItems: number
      }>
    ) {
      state.currentUser.swap = action.payload.user
      state.leaderboard.swap = action.payload.leaderboard
      state.totalItems.swap = action.payload.totalItems
      if (state.currentPage === 1) {
        state.top3Scorers.swap = action.payload.leaderboard
          .filter(entry => entry.rank <= 3)
          .sort((a, b) => a.rank - b.rank)
      }
      return state
    },
    setLpLeaderboardData(
      state,
      action: PayloadAction<{
        user: ILpEntry | null
        leaderboard: ILpEntry[]
        totalItems: number
      }>
    ) {
      state.currentUser.lp = action.payload.user
      state.leaderboard.lp = action.payload.leaderboard
      state.totalItems.lp = action.payload.totalItems
      if (state.currentPage === 1) {
        state.top3Scorers.lp = action.payload.leaderboard
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
    },
    getLeaderboardConfig(state) {
      return state
    },
    setLeaderboardConfig(
      state,
      action: PayloadAction<{
        refreshTime: number
        pointsDecimal: number
        promotedPools: IPromotedPool[]
        swapPairs: { tokenX: string; tokenY: string }[]
        lastSnapTimestamp: string
        pointsPerUSD: number
        swapMultiplier: string
        contentProgramDateStart: string
        contentProgramDateEnd: string
      }>
    ) {
      state.config = {
        refreshTime: action.payload.refreshTime,
        pointsDecimal: action.payload.pointsDecimal,
        promotedPools: action.payload.promotedPools,
        swapPairs: action.payload.swapPairs,
        lastSnapTimestamp: action.payload.lastSnapTimestamp,
        pointsPerUsd: action.payload.pointsPerUSD,
        swapMultiplier: action.payload.swapMultiplier,
        contentProgramDateStart: action.payload.contentProgramDateStart,
        contentProgramDateEnd: action.payload.contentProgramDateEnd
      }
      return state
    },
    setLeaderboardPriceFeeds(
      state,
      action: PayloadAction<
        Record<
          string,
          {
            pricePublishTime: number
            priceDecimals: number
            price: string
          }
        >
      >
    ) {
      state.priceFeeds = action.payload
      return state
    },
    setLeaderBoardType(state, action: PayloadAction<LeaderBoardType>) {
      state.type = action.payload
      return state
    },
    resetCurrentUser(state) {
      state.currentUser = { total: null, lp: null, swap: null }
    },
    getContentPointsRequest(state) {
      state.isLoading = true
    },

    setContentPoints(state, action: PayloadAction<CurrentContentPointsEntry[] | null>) {
      state.contentPoints = action.payload
      state.isLoading = false
    },
    resetContentPoints(state) {
      state.contentPoints = null
    }
  }
})

export const actions = leaderboardSlice.actions
export const reducer = leaderboardSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
