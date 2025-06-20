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
  }
  backedByBITZ: {
    tokenAddress: string
    amount: BN
    tokenPrice?: number
  } | null
  error: string | null
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
    stakedTokenSupply: null
  },
  backedByBITZ: null,
  error: null
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
    setLoading(state, action: PayloadAction<{ type: keyof LoadingStates; value: boolean }>) {
      state.loadingStates[action.payload.type] = action.payload.value
      return state
    },
    getStakedAmountAndBalance(state) {
      state.error = null
      state.loadingStates.stakeStats = true
      return state
    },
    setStakedAmountAndBalance(
      state,
      action: PayloadAction<{ stakedAmount: BN; stakedTokenSupply: BN }>
    ) {
      state.stakedData = {
        stakedAmount: action.payload.stakedAmount,
        stakedTokenSupply: action.payload.stakedTokenSupply
      }
      state.error = null
      state.loadingStates.stakeStats = false
      return state
    },
    setStakedAmountAndBalanceError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.loadingStates.stakeStats = false
      return state
    },
    getBackedByBITZ(state, _action: PayloadAction<GetBackedByBITZPayload>) {
      state.error = null
      state.loadingStates.backedByBITZ = true
      if (!state.backedByBITZ) {
        state.backedByBITZ = {
          tokenAddress: '',
          amount: new BN(0),
          tokenPrice: undefined
        }
      }
      return state
    },
    setBackedByBITZ(
      state,
      action: PayloadAction<{
        tokenAddress: string
        amount: BN
        tokenPrice?: number
      } | null>
    ) {
      state.backedByBITZ = action.payload
      state.loadingStates.backedByBITZ = false
      state.error = null
      return state
    },
    setBackedByBITZError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.loadingStates.backedByBITZ = false
      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
