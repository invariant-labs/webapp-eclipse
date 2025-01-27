import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '@store/consts/types'

export interface IReferralStore {
  code: string | null
  codeUsed: string | null
  proceeding: boolean
  success: boolean
}

export const defaultState: IReferralStore = {
  code: null,
  codeUsed: null,
  proceeding: false,
  success: false
}

export const referralSliceName = 'referral'

const referralSlice = createSlice({
  name: referralSliceName,
  initialState: defaultState,
  reducers: {
    setUserCode(
      state,
      action: PayloadAction<{
        code: string
      }>
    ) {
      state.code = action.payload.code
      return state
    },
    getUserCode(state) {
      return state
    },
    useCode(
      state,
      action: PayloadAction<{
        code: string
      }>
    ) {
      state.proceeding = true
      state.codeUsed = action.payload.code
      return state
    },
    setCodeUsed(state, action: PayloadAction<{ codeUsed: string }>) {
      state.codeUsed = action.payload.codeUsed
      return state
    },
    setSuccessState(state, action: PayloadAction<boolean>) {
      state.proceeding = false
      state.success = action.payload
      return state
    }
  }
})

export const actions = referralSlice.actions
export const reducer = referralSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
