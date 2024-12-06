import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { NetworkType } from '@store/consts/static'

export interface ILocker {
  lockerState: ILockerState
}

export interface LockPositionPayload {
  index: number
  network: NetworkType
}

interface ILockerState {
  inProgress: boolean
  success: boolean
}
const defaultStatus: ILocker = {
  lockerState: {
    inProgress: false,
    success: false
  }
}
export const lockerSliceName = 'locker'

const lockerSlice = createSlice({
  name: lockerSliceName,
  initialState: defaultStatus,
  reducers: {
    lockPosition(state, _action: PayloadAction<LockPositionPayload>) {
      state.lockerState.inProgress = true
      return state
    },
    setLockSuccess(state, action: PayloadAction<boolean>) {
      state.lockerState.inProgress = false
      state.lockerState.success = action.payload
      return state
    }
  }
})

export const actions = lockerSlice.actions
export const reducer = lockerSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
