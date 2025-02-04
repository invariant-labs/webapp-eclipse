import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TokenPositionEntry {
  token: string
  value: number
  positionId: string
  logo?: string
}

export interface TokenPositionsStore {
  positions: TokenPositionEntry[]
  totalAssets: number
  totalUnclaimedFee: number
  processedUnclaimedFeePositionIds: string[]
  processedAssetsPositionIds: string[]
  processedTokenPositionIds: string[]
}

export const defaultState: TokenPositionsStore = {
  positions: [],
  totalAssets: 0,
  totalUnclaimedFee: 0,
  processedUnclaimedFeePositionIds: [],
  processedAssetsPositionIds: [],
  processedTokenPositionIds: []
}

export const tokenPositionsSliceName = 'tokenOverviewPositions'

const tokenPositionsSlice = createSlice({
  name: tokenPositionsSliceName,
  initialState: defaultState,
  reducers: {
    addTokenPosition(state, action: PayloadAction<TokenPositionEntry>) {
      console.log('=== START addTokenPosition ===')
      console.log('Current positions:', JSON.stringify(state.positions))
      console.log('Adding position:', JSON.stringify(action.payload))

      const processedId = `${action.payload.token}_${action.payload.positionId}`

      if (state.processedTokenPositionIds.includes(processedId)) {
        console.log(
          `Token ${action.payload.token} for position ${action.payload.positionId} already processed`
        )
        console.log('=== END addTokenPosition ===')
        return
      }

      const existingToken = state.positions.find(pos => pos.token === action.payload.token)

      if (existingToken) {
        console.log('Found existing token:', existingToken.token)
        console.log('Current value:', existingToken.value)
        console.log('Adding value:', action.payload.value)

        state.positions = state.positions.map(pos =>
          pos.token === action.payload.token
            ? {
                ...pos,
                value: Number(pos.value) + Number(action.payload.value)
              }
            : pos
        )
      } else {
        console.log('Adding new token')
        state.positions = [
          ...state.positions,
          {
            token: action.payload.token,
            value: Number(action.payload.value),
            logo: action.payload.logo,
            positionId: action.payload.positionId
          }
        ]
      }

      state.processedTokenPositionIds = [...state.processedTokenPositionIds, processedId]

      console.log('Final positions:', JSON.stringify(state.positions))
      console.log('=== END addTokenPosition ===')
    },

    removeTokenPosition(state, action: PayloadAction<string>) {
      const positionToRemove = state.positions.find(pos => pos.positionId === action.payload)
      if (positionToRemove) {
        state.positions = state.positions.filter(pos => pos.positionId !== action.payload)
        state.processedTokenPositionIds = state.processedTokenPositionIds.filter(
          id => !id.endsWith(`_${action.payload}`)
        )
      }
    },

    clearTokenPositions(state) {
      state.positions = []
      state.totalAssets = 0
      state.totalUnclaimedFee = 0
      state.processedUnclaimedFeePositionIds = []
      state.processedAssetsPositionIds = []
      state.processedTokenPositionIds = []
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
      state.processedAssetsPositionIds = []
    },

    resetTotalUnclaimedFee(state) {
      state.totalUnclaimedFee = 0
      state.processedUnclaimedFeePositionIds = []
    }
  }
})

export const actions = tokenPositionsSlice.actions
export const reducer = tokenPositionsSlice.reducer
export type PayloadTypes =
  | PayloadAction<TokenPositionEntry>
  | PayloadAction<number>
  | PayloadAction<string>
