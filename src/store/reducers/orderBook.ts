import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { NetworkType } from '@store/consts/static'
import { FormData } from '@store/consts/tokenCreator/types'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { OrderBook } from '@invariant-labs/sdk-eclipse/src/market'
import { IncreaseLimitOrderLiquidity, LimitOrder } from '@invariant-labs/sdk-eclipse/lib/market'
import { PublicKey } from '@solana/web3.js'

export interface IOrderBook {
  currentOrderBook: OrderBook | null
  userLimitOrders: {
    account: LimitOrder
    publicKey: PublicKey
  }[]
  success: boolean
  inProgress: boolean
}

export interface IAddOrder extends IncreaseLimitOrderLiquidity {
  poolTickIndex: number
}

export interface AddOrderPayload {
  pair: Pair
}
const defaultStatus: IOrderBook = {
  currentOrderBook: null,
  success: false,
  inProgress: false,
  userLimitOrders: []
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
    addLimitOrder(state, action: PayloadAction<IAddOrder>) {
      return state
    },
    getUserOrders(state) {
      return state
    },
    setUserOrders(
      state,
      action: PayloadAction<
        {
          account: LimitOrder
          publicKey: PublicKey
        }[]
      >
    ) {
      state.userLimitOrders = action.payload

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
