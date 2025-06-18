import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { BN } from '@coral-xyz/anchor'

export interface StakeLiquidityPayload {
  amount: BN
}

export interface ISBitz {
  inProgress: boolean
  success: boolean
}

const defaultStatus: ISBitz = {
  inProgress: false,
  success: false
}
export const sBitzSliceName = 'sBitz'

const sBitzSlice = createSlice({
  name: sBitzSliceName,
  initialState: defaultStatus,
  reducers: {
    stake(state, _action: PayloadAction<StakeLiquidityPayload>) {
      state.inProgress = true
      return state
    },
    unStake(state, _action: PayloadAction<{}>) {
      return state
    },
    setProgressState(state, action: PayloadAction<{ inProgress: boolean; success: boolean }>) {
      state.inProgress = action.payload.inProgress
      state.success = action.payload.success

      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
