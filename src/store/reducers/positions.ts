import {
  CreatePosition,
  Position,
  PositionList,
  Tick
} from '@invariant-labs/sdk-eclipse/lib/market'
import { BN } from '@coral-xyz/anchor'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from '@store/consts/types'

export interface PositionWithAddress extends Position {
  address: PublicKey
}
export interface PositionsListStore {
  list: PositionWithAddress[]
  lockedList: PositionWithAddress[]
  head: number
  bump: number
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
  positionsList: PositionsListStore
  currentPositionTicks: CurrentPositionTicksStore
  initPosition: InitPositionStore
  shouldNotUpdateRange: boolean
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
  maxLiquidtiyPercentage: number
  minUtilizationPercentage: number
  tokenFrom: PublicKey
  tokenTo: PublicKey
  estimatedPriceAfterSwap: BN
  slippage: number
  swapAmount: BN
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
    initialized: false,
    loading: true
  },
  currentPositionTicks: {
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  },
  initPosition: {
    inProgress: false,
    success: false
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
    getCurrentPlotTicks(state, action: PayloadAction<GetCurrentTicksData>) {
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
    getCurrentPositionRangeTicks(state, _action: PayloadAction<string>) {
      state.currentPositionTicks.loading = true
      return state
    },
    setCurrentPositionRangeTicks(
      state,
      action: PayloadAction<{ lowerTick?: Tick; upperTick?: Tick }>
    ) {
      state.currentPositionTicks = {
        ...action.payload,
        loading: false
      }
      return state
    },
    claimFee(state, _action: PayloadAction<{ index: number; isLocked: boolean }>) {
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
    }
  }
})

export const actions = positionsSlice.actions
export const reducer = positionsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
