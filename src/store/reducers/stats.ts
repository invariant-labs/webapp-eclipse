import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { Intervals } from '@store/consts/static'
import { ChartSwitch, PayloadType } from '@store/consts/types'

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

export interface CumulativeValue {
  value: number
  change: number | null
}

export interface IStatsStore {
  volumePlot: TimeData[]
  liquidityPlot: TimeData[]
  feesPlot: TimeData[]
  volume24: Value24H
  tvl24: Value24H
  fees24: Value24H
  volume: Value24H
  tvl: Value24H
  fees: Value24H
  tokensData: TokenStatsData[]
  poolsData: PoolStatsData[]
  isLoading: boolean
  lastSnapTimestamp: number
  lastTimestamp: number
  lastInterval: Intervals | null
  currentInterval: Intervals | null
  columnChartType: ChartSwitch
  cumulativeVolume: CumulativeValue
  cumulativeFees: CumulativeValue
}

export const defaultState: IStatsStore = {
  volumePlot: [],
  liquidityPlot: [],
  feesPlot: [],
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
  volume: {
    value: 0,
    change: 0
  },
  tvl: {
    value: 0,
    change: 0
  },
  fees: {
    value: 0,
    change: 0
  },
  tokensData: [],
  poolsData: [],
  isLoading: false,
  lastTimestamp: 0,
  lastSnapTimestamp: 0,
  lastInterval: null,
  currentInterval: null,
  columnChartType: ChartSwitch.volume,
  cumulativeVolume: {
    value: 0,
    change: null
  },
  cumulativeFees: {
    value: 0,
    change: null
  }
}

export const statsSliceName = 'stats'
const statsSlice = createSlice({
  name: statsSliceName,
  initialState: defaultState,
  reducers: {
    setCurrentStats(
      state,
      action: PayloadAction<Omit<IStatsStore, 'isLoading'> & { lastInterval: Intervals }>
    ) {
      state = {
        ...action.payload,
        isLoading: false,
        lastTimestamp: +Date.now(),
        currentInterval: state.currentInterval,
        columnChartType: state.columnChartType
      }
      return state
    },
    setCurrentInterval(state, action: PayloadAction<{ interval: Intervals }>) {
      state.currentInterval = action.payload.interval
      return state
    },
    getCurrentStats(state) {
      state.isLoading = true

      return state
    },
    getCurrentIntervalStats(state, _action: PayloadAction<{ interval: Intervals }>) {
      state.isLoading = true
      return state
    },
    setLoadingStats(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload

      return state
    },
    setChartType(state, action: PayloadAction<ChartSwitch>) {
      state.columnChartType = action.payload

      return state
    }
  }
})

export const actions = statsSlice.actions
export const reducer = statsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
