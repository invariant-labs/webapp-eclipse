import { DEFAULT_PUBLIC_KEY, PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import { fromFee } from '@invariant-labs/sdk-eclipse/lib/utils'
import { BN } from '@coral-xyz/anchor'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'
import { FetcherRecords } from '@invariant-labs/sdk-eclipse'
import { Pair } from '@invariant-labs/sdk-eclipse/src'

export interface Swap {
  slippage: BN
  estimatedPriceAfterSwap: BN
  firstPair: Pair | null
  secondPair: Pair | null
  tokenFrom: PublicKey
  tokenBetween: PublicKey | null
  tokenTo: PublicKey
  amountIn: BN
  byAmountIn: boolean
  txid?: string
  inProgress?: boolean
  success?: boolean
  amountOut: BN
}

export interface Simulate {
  simulatePrice: BN
  fromToken: PublicKey
  toToken: PublicKey
  amount: BN
  success: boolean
  txid?: string
  inProgress?: boolean
}

export interface ISwapStore {
  swap: Swap
  accounts: FetcherRecords
  isLoading: boolean
}

export const defaultState: ISwapStore = {
  swap: {
    slippage: fromFee(new BN(1000)),
    estimatedPriceAfterSwap: new BN(0),
    firstPair: null,
    secondPair: null,
    tokenFrom: DEFAULT_PUBLIC_KEY,
    tokenBetween: null,
    tokenTo: DEFAULT_PUBLIC_KEY,
    amountIn: new BN(0),
    byAmountIn: false,
    amountOut: new BN(0)
  },
  accounts: {
    pools: {},
    tickmaps: {},
    ticks: {}
  },
  isLoading: false
}

export const swapSliceName = 'swap'
const swapSlice = createSlice({
  name: swapSliceName,
  initialState: defaultState,
  reducers: {
    swap(state, action: PayloadAction<Omit<Swap, 'txid'>>) {
      state.swap = {
        ...action.payload,
        inProgress: true
      }
      return state
    },
    setSwapSuccess(state, action: PayloadAction<boolean>) {
      state.swap.inProgress = false
      state.swap.success = action.payload
      return state
    },
    setPair(state, action: PayloadAction<{ tokenFrom: PublicKey; tokenTo: PublicKey }>) {
      state.swap.tokenFrom = action.payload.tokenFrom
      state.swap.tokenTo = action.payload.tokenTo
      return state
    },
    getTwoHopSwapData(state, _action: PayloadAction<{ tokenFrom: PublicKey; tokenTo: PublicKey }>) {
      state.isLoading = true
      return state
    },
    updateSwapPool(state, action: PayloadAction<{ address: PublicKey; pool: PoolStructure }>) {
      state.accounts.pools[action.payload.address.toString()] = action.payload.pool
      return state
    },
    setTwoHopSwapData(
      state,
      action: PayloadAction<{
        accounts: FetcherRecords
      }>
    ) {
      state.accounts = action.payload.accounts
      state.isLoading = false
      return state
    }
  }
})

export const actions = swapSlice.actions
export const reducer = swapSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
