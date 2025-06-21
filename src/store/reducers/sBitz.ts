import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
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
  stakeStats: boolean
  backedByBITZ: boolean
  stakeOperation: boolean
}

export interface ISBitz {
  inProgress: boolean
  success: boolean
  loadingStates: LoadingStates
  stakedData: {
    stakedAmount: BN | null
    stakedTokenSupply: BN | null
    sBitzTotalBalance?: BN | null
  }
  backedByBITZ: {
    tokenAddress: string
    amount: BN
    tokenPrice?: number
  } | null
}

const defaultStatus: ISBitz = {
  inProgress: false,
  success: false,
  loadingStates: {
    stakeStats: false,
    backedByBITZ: false,
    stakeOperation: false
  },
  stakedData: {
    stakedAmount: null,
    sBitzTotalBalance: null,
    stakedTokenSupply: null
  },
  backedByBITZ: null
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
      state.loadingStates.stakeStats = true
      return state
    },
    setStakedAmountAndBalance(
      state,
      action: PayloadAction<{ stakedAmount: BN; stakedTokenSupply: BN; sBitzTotalBalance: BN }>
    ) {
      state.stakedData = {
        stakedAmount: action.payload.stakedAmount,
        stakedTokenSupply: action.payload.stakedTokenSupply,
        sBitzTotalBalance: action.payload.sBitzTotalBalance
      }
      state.loadingStates.stakeStats = false
      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
