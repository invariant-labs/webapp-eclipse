import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'

export interface ISBitz {}

const defaultStatus: ISBitz = {}
export const sBitzSliceName = 'sBitz'

const sBitzSlice = createSlice({
  name: sBitzSliceName,
  initialState: defaultStatus,
  reducers: {
    stake(state, _action: PayloadAction<{}>) {
      return state
    },
    unStake(state, _action: PayloadAction<{}>) {
      return state
    }
  }
})

export const actions = sBitzSlice.actions
export const reducer = sBitzSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
