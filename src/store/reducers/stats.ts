import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'

export interface TimeData {
  timestamp: number
  value: number | null
}

export interface Value24H {
  value: number
  change: number | null
}

export interface TokenStatsData {
  address: PublicKey
  price: number
  // priceChange: number
  volume24: number
  tvl: number
}

export interface PoolStatsData {
  poolAddress: PublicKey
  tokenX: PublicKey
  tokenY: PublicKey
  fee: number
  volume24: number
  tvl: number
  apy: number
  liquidityX: number
  liquidityY: number
  lockedX: number
  lockedY: number
}

export interface IStatsStore {
  volumePlot: TimeData[]
  liquidityPlot: TimeData[]
  volume24: Value24H
  tvl24: Value24H
  fees24: Value24H
  tokensData: TokenStatsData[]
  poolsData: PoolStatsData[]
  isLoading: boolean
  lastTimestamp: number
}

export const defaultState: IStatsStore = {
  volumePlot: [],
  liquidityPlot: [],
  volume24: {
    value: 0,
    change: 0
  },
  tvl24: {
    value: 0,
    change: 0
  },
  fees24: {
    value: 0,
    change: 0
  },
  tokensData: [],
  poolsData: [],
  isLoading: false,
  lastTimestamp: 0
}

export const statsSliceName = 'stats'
const statsSlice = createSlice({
  name: statsSliceName,
  initialState: defaultState,
  reducers: {
    setCurrentStats(state, action: PayloadAction<Omit<IStatsStore, 'isLoading'>>) {
      state = {
        ...action.payload,
        isLoading: false,
        lastTimestamp: +Date.now()
      }
      return state
    },
    getCurrentStats(state) {
      state.isLoading = true

      return state
    },
    setLoadingStats(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload

      return state
    }
  }
})

export const actions = statsSlice.actions
export const reducer = statsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
