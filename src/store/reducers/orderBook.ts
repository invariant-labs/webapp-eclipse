import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PayloadType } from '../consts/types'
import { NetworkType } from '@store/consts/static'
import { FormData } from '@store/consts/tokenCreator/types'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { OrderBook } from '@invariant-labs/sdk-eclipse/src/market'
import {
  DecreaseLimitOrderLiquidity,
  IncreaseLimitOrderLiquidity,
  LimitOrder
} from '@invariant-labs/sdk-eclipse/lib/market'
import { PublicKey } from '@solana/web3.js'

export interface IOrderBook {
  currentOrderBook: OrderBook | null
  userLimitOrders: {
    account: LimitOrder
    publicKey: PublicKey
  }[]

  loadingState: {
    inProgress: boolean
    success: boolean
  }
  isLoadingOrderbook: boolean
  isLoadingUserOrders: boolean
}

export interface IAddOrder extends IncreaseLimitOrderLiquidity {
  poolTickIndex: number
}

export interface IRemoveOrder
  extends Omit<DecreaseLimitOrderLiquidity, 'userTokenX' | 'userTokenY'> {}

export interface AddOrderPayload {
  pair: Pair
}
const defaultStatus: IOrderBook = {
  currentOrderBook: null,
  loadingState: {
    inProgress: false,
    success: true
  },
  isLoadingOrderbook: false,
  isLoadingUserOrders: false,
  userLimitOrders: []
}
export const orderBookName = 'orderBook'

const orderBookSlice = createSlice({
  name: orderBookName,
  initialState: defaultStatus,
  reducers: {
    getOrderBook(state, _action: PayloadAction<AddOrderPayload>) {
      console.log('test')
      state.isLoadingOrderbook = true
      return state
    },
    setOrderBook(state, action: PayloadAction<OrderBook | null>) {
      state.currentOrderBook = action.payload
      state.isLoadingOrderbook = false

      return state
    },
    addLimitOrder(state, _action: PayloadAction<IAddOrder>) {
      state.loadingState.inProgress = true
      return state
    },
    removeLimitOrder(state, _action: PayloadAction<IRemoveOrder>) {
      return state
    },
    getUserOrders(state) {
      state.isLoadingUserOrders = true
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
      state.isLoadingUserOrders = false
      state.userLimitOrders = action.payload

      return state
    },
    setOrderSuccess(state, action: PayloadAction<boolean>) {
      state.loadingState.inProgress = false
      state.loadingState.success = action.payload
      return state
    }
  }
})

export const actions = orderBookSlice.actions
export const reducer = orderBookSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
