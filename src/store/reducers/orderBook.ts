import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { NetworkType } from '@store/consts/static'
import { FormData } from '@store/consts/tokenCreator/types'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { OrderBook } from '@invariant-labs/sdk-eclipse/src/market'
import { IncreaseLimitOrderLiquidity } from '@invariant-labs/sdk-eclipse/lib/market'

export interface IOrderBook {
  currentOrderBook: OrderBook | null
  success: boolean
  inProgress: boolean
}

export interface AddOrderPayload {
  pair: Pair
}
const defaultStatus: IOrderBook = {
  currentOrderBook: null,
  success: false,
  inProgress: false
}
export const orderBookName = 'orderBook'

const orderBookSlice = createSlice({
  name: orderBookName,
  initialState: defaultStatus,
  reducers: {
    getOrderBook(state, _action: PayloadAction<AddOrderPayload>) {
      return state
    },
    setOrderBook(state, action: PayloadAction<OrderBook | null>) {
      state.currentOrderBook = action.payload

      return state
    },
    addLimitOrder(state, action: PayloadAction<IncreaseLimitOrderLiquidity>) {
      console.log('test')
      return state
    },
    getUserOrders(state) {
      return state
    },
    setOrderSuccess(state, action: PayloadAction<boolean>) {
      state.inProgress = false
      state.success = action.payload
      return state
    }
  }
})

export const actions = orderBookSlice.actions
export const reducer = orderBookSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
