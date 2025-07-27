import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType, StakeSwitch } from '../consts/types'
import { BN } from '@coral-xyz/anchor'

// Remove duplicate interface
export interface StakeLiquidityPayload {
  amount: BN
  byAmountIn: boolean
}

export interface GetBackedByBITZPayload {
  amount: BN
  tokenAddress?: string
}
export interface HolderInfo {
  holders: number
}
export interface HoldersResponse {
  data: Record<string, HolderInfo>
  lastUpdateTimestamp: number
}
export interface LoadingStates {
  stakeData: boolean
  stakeOperation: boolean
  bitzMarketData: boolean
}
export interface BitzMarketData {
  marketCap: number | null
  sBitzSupply: number | null
  holders: number | null
  totalSupply: number | null
  sBitzAmount: number | null
  bitzAmount: number | null
}

export interface ISBitz {
  inProgress: boolean
  success: boolean
  loadingStates: LoadingStates
  stakedData: {
    stakedAmount: BN | null
    stakedTokenSupply: BN | null
    bitzTotalBalance?: BN | null
  }
  stakeTab: StakeSwitch
  stakeInputVal: string
  unstakeInputVal: string
  bitzMarketData: BitzMarketData
}

const defaultStatus: ISBitz = {
  inProgress: false,
  success: false,
  loadingStates: {
    stakeData: false,
    stakeOperation: false,
    bitzMarketData: false
  },
  stakedData: {
    stakedAmount: null,
    bitzTotalBalance: null,
    stakedTokenSupply: null
  },
  stakeTab: StakeSwitch.Stake,
  stakeInputVal: '',
  unstakeInputVal: '',
  bitzMarketData: {
    marketCap: null,
    sBitzSupply: null,
    holders: null,
    totalSupply: null,
    sBitzAmount: null,
    bitzAmount: null
  }
}

export const sBitzSliceName = 'sBitz'

const sBitzSlice = createSlice({
  name: sBitzSliceName,
  initialState: defaultStatus,
  reducers: {
    stake(state, _action: PayloadAction<StakeLiquidityPayload>) {
      state.inProgress = true
      state.loadingStates.stakeOperation = true
      return state
    },
    unstake(state, _action: PayloadAction<StakeLiquidityPayload>) {
      state.inProgress = true
      state.loadingStates.stakeOperation = true
      return state
    },
    setProgressState(state, action: PayloadAction<{ inProgress: boolean; success: boolean }>) {
      state.inProgress = action.payload.inProgress
      state.success = action.payload.success
      state.loadingStates.stakeOperation = action.payload.inProgress
      return state
    },

    getStakedAmountAndBalance(state) {
      state.loadingStates.stakeData = true
      return state
    },
    setStakedAmountAndBalance(
      state,
      action: PayloadAction<{
        stakedAmount: BN | null
        stakedTokenSupply: BN | null
        bitzTotalBalance: BN | null
      }>
    ) {
      state.stakedData = {
        stakedAmount: action.payload.stakedAmount,
        stakedTokenSupply: action.payload.stakedTokenSupply,
        bitzTotalBalance: action.payload.bitzTotalBalance
      }
      state.loadingStates.stakeData = false
      return state
    },
    setStakeTab(state, action: PayloadAction<{ tab: StakeSwitch }>) {
      state.stakeTab = action.payload.tab
      return state
    },
    setStakeInputVal(state, action: PayloadAction<{ val: string }>) {
      state.stakeInputVal = action.payload.val
      return state
    },
    setUnstakeInputVal(state, action: PayloadAction<{ val: string }>) {
      state.unstakeInputVal = action.payload.val
      return state
    },
    getCurrentStats(state) {
      state.loadingStates.bitzMarketData = true
      return state
    },
    setLoadingStats(state, action: PayloadAction<boolean>) {
      state.loadingStates.bitzMarketData = action.payload
      return state
    },
    setCurrentStats(state, action: PayloadAction<BitzMarketData>) {
      state.loadingStates.bitzMarketData = false
      state.bitzMarketData = action.payload
      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
