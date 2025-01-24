import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { NetworkType } from '@store/consts/static'
import { FormData } from '@store/consts/tokenCreator/types'

export interface ICreator {
  creatorState: ICreatorState
}

export interface CreateTokenPayload {
  data: FormData
  network: NetworkType
}

interface ICreatorState {
  inProgress: boolean
  success: boolean
}
const defaultStatus: ICreator = {
  creatorState: {
    inProgress: false,
    success: false
  }
}
export const creatorSliceName = 'creator'
const snackbarsSlice = createSlice({
  name: creatorSliceName,
  initialState: defaultStatus,
  reducers: {
    createToken(state, _action: PayloadAction<CreateTokenPayload>) {
      state.creatorState.inProgress = true
      return state
    },
    setCreateSuccess(state, action: PayloadAction<boolean>) {
      state.creatorState.inProgress = false
      state.creatorState.success = action.payload
      return state
    }
  }
})

export const actions = snackbarsSlice.actions
export const reducer = snackbarsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
