import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType, StakeSwitch } from '../consts/types'
import { BN } from '@coral-xyz/anchor'

// Remove duplicate interface
export interface StakeLiquidityPayload {
  amount: BN
}

export interface GetBackedByBITZPayload {
  amount: BN
  tokenAddress?: string
}

export interface LoadingStates {
  stakeData: boolean
  stakeOperation: boolean
  apyAndApr: boolean
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
  apyAndApr: { apy: number | null; apr: number | null }
  stakeTab: StakeSwitch
}

const defaultStatus: ISBitz = {
  inProgress: false,
  success: false,
  loadingStates: {
    stakeData: false,
    stakeOperation: false,
    apyAndApr: false
  },
  stakedData: {
    stakedAmount: null,
    bitzTotalBalance: null,
    stakedTokenSupply: null
  },
  apyAndApr: {
    apy: null,
    apr: null
  },
  stakeTab: StakeSwitch.Stake
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
    getApyAndApr(state) {
      state.loadingStates.apyAndApr = true
      return state
    },
    setApyAndApr(state, action: PayloadAction<{ apy: number | null; apr: number | null }>) {
      state.apyAndApr = { apr: action.payload.apr, apy: action.payload.apy }
      state.loadingStates.apyAndApr = false
      return state
    },
    setStakeTab(state, action: PayloadAction<{ tab: StakeSwitch }>) {
      state.stakeTab = action.payload.tab
      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
