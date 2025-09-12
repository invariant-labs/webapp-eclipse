import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LockerSwitch, PayloadType } from '../consts/types'
import { BN } from '@coral-xyz/anchor'

export interface LockLiquidityPayload {
  amount: BN
}

export interface LoadingStates {
  lockOperation: boolean
  invtMarketData: boolean
}

export interface InvtMarketData {
  totalXInvt: number | null
}

export interface IxInvt {
  inProgress: boolean
  success: boolean
  loadingStates: LoadingStates

  lockerTab: LockerSwitch
  lockInputVal: string
  unlockInputVal: string
  invtMarketData: InvtMarketData
}

const defaultStatus: IxInvt = {
  inProgress: false,
  success: false,
  loadingStates: {
    lockOperation: false,
    invtMarketData: false
  },
  lockerTab: LockerSwitch.Lock,
  lockInputVal: '',
  unlockInputVal: '',
  invtMarketData: {
    totalXInvt: 0
  }
}

export const xInvtSliceName = 'xInvt'

const xinvtLockerSlice = createSlice({
  name: xInvtSliceName,
  initialState: defaultStatus,
  reducers: {
    lock(state, _action: PayloadAction<LockLiquidityPayload>) {
      state.inProgress = true
      state.loadingStates.lockOperation = true
      return state
    },
    unlock(state, _action: PayloadAction<LockLiquidityPayload>) {
      state.inProgress = true
      state.loadingStates.lockOperation = true
      return state
    },
    setProgressState(state, action: PayloadAction<{ inProgress: boolean; success: boolean }>) {
      state.inProgress = action.payload.inProgress
      state.success = action.payload.success
      state.loadingStates.lockOperation = action.payload.inProgress
      return state
    },

    setLockTab(state, action: PayloadAction<{ tab: LockerSwitch }>) {
      state.lockerTab = action.payload.tab
      return state
    },
    setLockInputVal(state, action: PayloadAction<{ val: string }>) {
      state.lockInputVal = action.payload.val
      return state
    },
    setUnlockInputVal(state, action: PayloadAction<{ val: string }>) {
      state.unlockInputVal = action.payload.val
      return state
    },
    getCurrentStats(state) {
      state.loadingStates.invtMarketData = true
      return state
    },
    setCurrentStats(state, action: PayloadAction<InvtMarketData>) {
      state.loadingStates.invtMarketData = false
      state.invtMarketData = action.payload
      return state
    },
    setLoadingStats(state, action: PayloadAction<boolean>) {
      state.loadingStates.invtMarketData = action.payload
      return state
    }
  }
})

export const actions = xinvtLockerSlice.actions
export const reducer = xinvtLockerSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
