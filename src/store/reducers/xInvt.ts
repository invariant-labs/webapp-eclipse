import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LockerSwitch, PayloadType } from '../consts/types'
import { BN } from '@coral-xyz/anchor'

export interface IPromotedPool {
  address: string
  pointsPerSecond: string
}
export interface IConfigResponse {
  pointsDecimal: number
  promotedPools: IPromotedPool[]
  lastSnapTimestamp: number
}

export interface UserPoints {
  accumulatedRewards: string
  claimableRewards: string
}
export interface getPoinstxInvtResponse extends UserPoints {
  address: string
}
export interface LockLiquidityPayload {
  amount: BN
}

export interface LoadingStates {
  lockOperation: boolean
  invtMarketData: boolean
  config: boolean
  claimPoints: boolean
}

export interface InvtMarketData {
  lockedInvt: number | null
  burnEndTime: string | null
  burnStartTime: string | null
  mintEndTime: string | null
  mintStartTime: string | null
}

export interface IxInvt {
  inProgress: boolean
  success: boolean
  loadingStates: LoadingStates
  lockerTab: LockerSwitch
  lockInputVal: string
  unlockInputVal: string
  invtMarketData: InvtMarketData
  config: IConfigResponse
  userPoints: UserPoints
}

const defaultStatus: IxInvt = {
  inProgress: false,
  success: false,
  loadingStates: {
    lockOperation: false,
    invtMarketData: false,
    config: false,
    claimPoints: false
  },
  lockerTab: LockerSwitch.Lock,
  lockInputVal: '',
  unlockInputVal: '',
  invtMarketData: {
    lockedInvt: 0,
    burnEndTime: '',
    burnStartTime: '',
    mintEndTime: '',
    mintStartTime: ''
  },
  config: {
    lastSnapTimestamp: 0,
    pointsDecimal: 0,
    promotedPools: []
  },
  userPoints: {
    accumulatedRewards: '',
    claimableRewards: ''
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
    },
    getXInvtConfig(state) {
      state.loadingStates.config = true
      return state
    },
    setXInvtConfig(state, action: PayloadAction<IConfigResponse>) {
      state.loadingStates.config = false
      state.config = action.payload

      return state
    },
    getUserPoints(state) {
      state.loadingStates.claimPoints = true
      return state
    },
    setUserPoints(state, action: PayloadAction<UserPoints>) {
      state.loadingStates.claimPoints = false
      state.userPoints = action.payload

      return state
    }
  }
})

export const actions = xinvtLockerSlice.actions
export const reducer = xinvtLockerSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
