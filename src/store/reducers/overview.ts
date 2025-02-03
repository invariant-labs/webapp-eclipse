import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TokenPositionEntry {
  token: string
  value: number
}

export interface TokenPosititionsStore {
  positions: TokenPositionEntry[]
  totalAssets: number
  totalUnclaimedFee: number
  processedUnclaimedFeePositionIds: string[]
  processedAssetsPositionIds: string[]
}

export const defaultState: TokenPosititionsStore = {
  positions: [],
  totalAssets: 0,
  totalUnclaimedFee: 0,
  processedUnclaimedFeePositionIds: [],
  processedAssetsPositionIds: []
}

export const tokenPositionsSliceName = 'tokenOverviewPositions'

const tokenPositionsSlice = createSlice({
  name: tokenPositionsSliceName,
  initialState: defaultState,
  reducers: {
    addTokenPosition(state, action: PayloadAction<TokenPositionEntry>) {
      const existingTokenIndex = state.positions.findIndex(
        pos => pos.token === action.payload.token
      )
      if (existingTokenIndex !== -1) {
        state.positions[existingTokenIndex].value += action.payload.value
      } else {
        state.positions.push(action.payload)
      }
    },

    removeTokenPosition(state, action: PayloadAction<string>) {
      state.positions = state.positions.filter(pos => pos.token !== action.payload)
    },

    clearTokenPositions(state) {
      state.positions = []
      state.totalAssets = 0
      state.totalUnclaimedFee = 0
      state.processedAssetsPositionIds = []
      state.processedUnclaimedFeePositionIds = []
    },

    addTotalAssets(
      state,
      action: PayloadAction<{
        positionId: string
        value: number | null
      }>
    ) {
      if (
        action.payload.value !== null &&
        !state.processedAssetsPositionIds.includes(action.payload.positionId)
      ) {
        state.totalAssets += action.payload.value
        state.processedAssetsPositionIds.push(action.payload.positionId)
      }
    },

    setTotalAssets(state, action: PayloadAction<number>) {
      state.totalAssets = action.payload
    },

    addTotalUnclaimedFee(
      state,
      action: PayloadAction<{
        positionId: string
        value: number | null
      }>
    ) {
      if (
        action.payload.value !== 0 &&
        !state.processedUnclaimedFeePositionIds.includes(action.payload.positionId)
      ) {
        state.totalUnclaimedFee += action.payload.value ?? 0
        state.processedUnclaimedFeePositionIds.push(action.payload.positionId)
      }
    },

    setTotalUnclaimedFee(state, action: PayloadAction<number>) {
      state.totalUnclaimedFee = action.payload
    },

    resetTotalAssets(state) {
      state.totalAssets = 0
    },

    resetTotalUnclaimedFee(state) {
      state.totalUnclaimedFee = 0
    }
  }
})

export const actions = tokenPositionsSlice.actions
export const reducer = tokenPositionsSlice.reducer
export type PayloadTypes =
  | PayloadAction<TokenPositionEntry>
  | PayloadAction<number>
  | PayloadAction<string>
