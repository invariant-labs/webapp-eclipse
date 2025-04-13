import { DEFAULT_PUBLIC_KEY, PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import { fromFee } from '@invariant-labs/sdk-eclipse/lib/utils'
import { BN } from '@coral-xyz/anchor'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'
import { FetcherRecords } from '@invariant-labs/sdk-eclipse'
import { Pair } from '@invariant-labs/sdk-eclipse/src'
import { RouteTemplateProps } from '@components/TransactionRoute/FlowChartGrid/types/types'
import { SwapToken } from '@store/selectors/solanaWallet'

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

export interface SwapRoute {
  percent: number
  swapInfo: {
    ammKey: PublicKey
    feeAmount: number
    feeMint: PublicKey
    inAmount: BN
    inputMint: PublicKey
    label: string
    outAmount: BN
    metadata: {
      fee_rate?: number
      fee?: number
      tick_spacing: number
    }
    outputMint: PublicKey
  }
}

export interface SwapRoutesResponse {
  inAmount: number
  inputMint: PublicKey
  outAmount: number
  otherAmountThreshold: number
  outputMint: PublicKey
  platformFee: number | null
  priceImpactPct: number
  routePlan: SwapRoute[]
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

export interface AgregatorSimulateDetails {
  priceImpactPct: number
  otherAmountThreshold: number
  amountOutWithFee: number
  feePercent?: number
}

export interface AgregatorSwapRoutes {
  swapRouteLoading: boolean
  swapRouteError?: string
  swapSimulateDetails?: AgregatorSimulateDetails | undefined
  swapRouteResponse?: RouteTemplateProps
}

export interface ISwapStore {
  swap: Swap
  accounts: FetcherRecords
  isLoading: boolean
  swapRoute: AgregatorSwapRoutes
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
  swapRoute: {
    swapRouteLoading: false,
    swapSimulateDetails: undefined,
    swapRouteResponse: undefined
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
    setSwapRouteLoading(state, action: PayloadAction<boolean>) {
      state.swapRoute.swapRouteLoading = action.payload
      return state
    },
    setSwapRouteError(state, action: PayloadAction<string | undefined>) {
      state.swapRoute.swapRouteError = action.payload
      return state
    },
    setSwapRouteResponse(state, action: PayloadAction<RouteTemplateProps | undefined>) {
      state.swapRoute.swapRouteResponse = action.payload
      state.swapRoute.swapRouteLoading = false
      return state
    },
    setSwapSimulateDetails(state, action: PayloadAction<AgregatorSimulateDetails | undefined>) {
      state.swapRoute.swapSimulateDetails = action.payload
      return state
    },
    fetchSwapRoute(
      state,
      _action: PayloadAction<{
        amountIn: BN
        slippage: number
        tokens: SwapToken[]
        tokenFrom: PublicKey
        tokenTo: PublicKey
      }>
    ) {
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
