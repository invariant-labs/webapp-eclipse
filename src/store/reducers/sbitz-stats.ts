import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '@store/consts/types'

export interface TimeData {
  timestamp: number
  value: number
}

export interface StakingStatsResponse {
  timestamp: number
  bitzStaked: string
  sBitzTVL: number
  bitzSupply: string
  totalBitzStaked: string
  sbitzHolders: number
  sbitzSupply: string
  bitzHolders: number
  rewards24h: string
  sbitzStakedPlot: TimeData[]
  bitzStakedPlot: TimeData[]
  sbitzTVLPlot: TimeData[]
}

export interface IStatsStore {
  // Current snapshot data
  timestamp: number
  bitzStaked: string
  sBitzTVL: number
  bitzSupply: string
  totalBitzStaked: string
  sbitzHolders: number
  sbitzSupply: string
  bitzHolders: number
  rewards24h: string

  // Plot data arrays
  sbitzSupplyPlot: TimeData[]
  bitzStakedPlot: TimeData[]
  sbitzTVLPlot: TimeData[]

  // State management
  isLoading: boolean
  lastTimestamp: number
}

export const defaultState: IStatsStore = {
  timestamp: 0,
  bitzStaked: '0',
  sBitzTVL: 0,
  bitzSupply: '0',
  totalBitzStaked: '0',
  sbitzHolders: 0,
  sbitzSupply: '0',
  bitzHolders: 0,
  rewards24h: '0',

  sbitzSupplyPlot: [],
  bitzStakedPlot: [],
  sbitzTVLPlot: [],

  isLoading: false,
  lastTimestamp: 0
}

export const sbitzStatsSliceName = 'sbitz-stats'

const statsSlice = createSlice({
  name: sbitzStatsSliceName,
  initialState: defaultState,
  reducers: {
    setCurrentStats(state, action: PayloadAction<StakingStatsResponse>) {
      const { ...statsData } = action.payload

      return {
        ...state,
        ...statsData,
        isLoading: false,
        lastTimestamp: Date.now()
      }
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
