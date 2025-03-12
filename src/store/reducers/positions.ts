import {
  CreatePosition,
  PoolStructure,
  Position,
  PositionList,
  Tick,
  Tickmap
} from '@invariant-labs/sdk-eclipse/lib/market'
import { BN } from '@coral-xyz/anchor'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'

export type FetchTick = 'lower' | 'upper'
export interface PositionWithAddress extends Position {
  address: PublicKey
}
export interface PositionsListStore {
  list: PositionWithAddress[]
  lockedList: PositionWithAddress[]
  head: number
  bump: number
  isAllClaimFeesLoading: boolean
  initialized: boolean
  loading: boolean
}

export interface PlotTickData {
  x: number
  y: number
  index: number
}

export interface PlotTicks {
  rawTickIndexes: number[]
  allData: PlotTickData[]
  userData: PlotTickData[]
  loading: boolean
  hasError?: boolean
}

export interface InitPositionStore {
  inProgress: boolean
  success: boolean
}

export interface CurrentPositionTicksStore {
  lowerTick?: Tick
  upperTick?: Tick
  loading: boolean
}
export interface IPositionsStore {
  lastPage: number
  plotTicks: PlotTicks
  currentPoolIndex: number | null
  positionsList: PositionsListStore
  currentPositionId: string
  currentPositionTicks: CurrentPositionTicksStore
  initPosition: InitPositionStore
  shouldNotUpdateRange: boolean
  unclaimedFees: {
    total: number
    loading: boolean
    lastUpdate: number
  }
  prices: {
    data: Record<string, number>
  }
}

export interface InitPositionData
  extends Omit<CreatePosition, 'owner' | 'userTokenX' | 'userTokenY' | 'pair'> {
  tokenX: PublicKey
  tokenY: PublicKey
  fee: BN
  tickSpacing: number
  initPool?: boolean
  poolIndex: number | null
  initTick?: number
  xAmount: number
  yAmount: number
}

export interface SwapAndCreatePosition
  extends Omit<
    CreatePosition,
    'pair' | 'liquidityDelta' | 'knownPrice' | 'userTokenX' | 'userTokenY' | 'slippage'
  > {
  xAmount: BN
  yAmount: BN
  tokenX: PublicKey
  tokenY: PublicKey
  swapAmount: BN
  byAmountIn: boolean
  xToY: boolean
  swapPool: PoolStructure
  swapPoolTickmap: Tickmap
  swapSlippage: BN
  estimatedPriceAfterSwap: BN
  crossedTicks: number[]
  positionPair: { fee: BN; tickSpacing: number }
  positionPoolIndex: number
  positionPoolPrice: BN
  positionSlippage: BN
  liquidityDelta: BN
  minUtilizationPercentage: BN
  isSamePool: boolean
}

export interface GetCurrentTicksData {
  poolIndex: number
  isXtoY: boolean
  fetchTicksAndTickmap?: boolean
  disableLoading?: boolean
  onlyUserPositionsEnabled?: boolean
}

export interface ClosePositionData {
  positionIndex: number
  claimFarmRewards?: boolean
  onSuccess: () => void
}

export interface SetPositionData {
  index: number
  position: Position
}

export const defaultState: IPositionsStore = {
  lastPage: 1,
  currentPoolIndex: null,
  plotTicks: {
    rawTickIndexes: [],
    allData: [],
    userData: [],
    loading: false
  },
  positionsList: {
    list: [],
    lockedList: [],
    head: 0,
    bump: 0,
    isAllClaimFeesLoading: false,
    initialized: false,
    loading: true
  },
  currentPositionId: '',
  currentPositionTicks: {
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  },
  initPosition: {
    inProgress: false,
    success: false
  },
  unclaimedFees: {
    total: 0,
    loading: false,
    lastUpdate: 0
  },
  prices: {
    data: {}
  },

  shouldNotUpdateRange: false
}

export const positionsSliceName = 'positions'
const positionsSlice = createSlice({
  name: 'positions',
  initialState: defaultState,
  reducers: {
    setLastPage(state, action: PayloadAction<number>) {
      state.lastPage = action.payload
      return state
    },
    initPosition(state, _action: PayloadAction<InitPositionData>) {
      state.initPosition.inProgress = true
      return state
    },
    swapAndInitPosition(state, _action: PayloadAction<SwapAndCreatePosition>) {
      state.initPosition.inProgress = true
      return state
    },
    setInitPositionSuccess(state, action: PayloadAction<boolean>) {
      state.initPosition.inProgress = false
      state.initPosition.success = action.payload
      return state
    },
    setPlotTicks(
      state,
      action: PayloadAction<{
        allPlotTicks: PlotTickData[]
        userPlotTicks: PlotTickData[]
        rawTickIndexes: number[]
      }>
    ) {
      state.plotTicks.rawTickIndexes = action.payload.rawTickIndexes
      state.plotTicks.allData = action.payload.allPlotTicks
      state.plotTicks.userData = action.payload.userPlotTicks
      state.plotTicks.loading = false
      state.plotTicks.hasError = false
      return state
    },
    setErrorPlotTicks(state, action: PayloadAction<PlotTickData[]>) {
      state.plotTicks.allData = action.payload
      state.plotTicks.userData = action.payload
      state.plotTicks.loading = false
      state.plotTicks.hasError = true
      return state
    },
    setAllClaimLoader(state, action: PayloadAction<boolean>) {
      state.positionsList.isAllClaimFeesLoading = action.payload
    },
    calculateTotalUnclaimedFees(state) {
      state.unclaimedFees.loading = true
      return state
    },
    setUnclaimedFees(state, action: PayloadAction<number>) {
      state.unclaimedFees = {
        total: action.payload,
        loading: false,
        lastUpdate: Date.now()
      }
      return state
    },
    setUnclaimedFeesError(state) {
      state.unclaimedFees = {
        ...state.unclaimedFees,
        loading: false
      }
      return state
    },
    setPrices(state, action: PayloadAction<Record<string, number>>) {
      state.prices = {
        data: action.payload
      }
      return state
    },

    getCurrentPlotTicks(state, action: PayloadAction<GetCurrentTicksData>) {
      state.currentPoolIndex = action.payload.poolIndex
      state.plotTicks.loading = !action.payload.disableLoading
      return state
    },
    setPositionsList(state, action: PayloadAction<[PositionWithAddress[], PositionList, boolean]>) {
      state.positionsList.list = action.payload[0]
      state.positionsList.head = action.payload[1].head
      state.positionsList.bump = action.payload[1].bump
      state.positionsList.initialized = action.payload[2]
      state.positionsList.loading = false
      return state
    },
    setLockedPositionsList(state, action: PayloadAction<PositionWithAddress[]>) {
      state.positionsList.lockedList = action.payload
      return state
    },
    getPositionsList(state) {
      state.positionsList.loading = true
      return state
    },
    setPositionRangeTicks(
      state,
      action: PayloadAction<{ positionId: string; lowerTick: number; upperTick: number }>
    ) {
      state.positionsList.list.map(position => {
        if (position.address.toString() === action.payload.positionId) {
          position = {
            ...position,
            lowerTickIndex: action.payload.lowerTick,
            upperTickIndex: action.payload.upperTick
          }
        }
      })
    },
    getSinglePosition(state, _action: PayloadAction<{ index: number; isLocked: boolean }>) {
      return state
    },
    setSinglePosition(state, action: PayloadAction<SetPositionData>) {
      state.positionsList.list[action.payload.index] = {
        address: state.positionsList.list[action.payload.index].address,
        ...action.payload.position
      }
      return state
    },
    getCurrentPositionRangeTicks(
      state,
      _action: PayloadAction<{ id: string; fetchTick?: FetchTick }>
    ) {
      state.currentPositionTicks.loading = true
      return state
    },
    setCurrentPositionRangeTicks(
      state,
      action: PayloadAction<{ lowerTick?: Tick; upperTick?: Tick }>
    ) {
      state.currentPositionTicks = {
        lowerTick: action.payload.lowerTick
          ? action.payload.lowerTick
          : state.currentPositionTicks.lowerTick,
        upperTick: action.payload.upperTick
          ? action.payload.upperTick
          : state.currentPositionTicks.upperTick,
        loading: false
      }
      return state
    },
    claimFee(state, _action: PayloadAction<{ index: number; isLocked: boolean }>) {
      return state
    },
    claimAllFee(state) {
      return state
    },
    closePosition(state, _action: PayloadAction<ClosePositionData>) {
      return state
    },
    resetState(state) {
      state = defaultState
      return state
    },
    setShouldNotUpdateRange(state, action: PayloadAction<boolean>) {
      state.shouldNotUpdateRange = action.payload
      return state
    },
    setCurrentPositionId(state, action: PayloadAction<string>) {
      state.currentPositionId = action.payload
      return state
    }
  }
})

export const actions = positionsSlice.actions
export const reducer = positionsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
