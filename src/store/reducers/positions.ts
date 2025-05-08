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

export interface PositionWithTicks extends Position {
  lowerTick: Tick
  upperTick: Tick
  ticksLoading: boolean
}
export interface PositionWithAddress extends PositionWithTicks {
  address: PublicKey
}

export interface PositionWithoutTicks extends Position {
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

export interface IPositionsStore {
  lastPage: number
  plotTicks: PlotTicks
  currentPoolIndex: number | null
  positionsList: PositionsListStore
  currentPositionId: string
  initPosition: InitPositionStore
  shouldNotUpdateRange: boolean
  prices: {
    data: Record<string, number>
  }
  showFeesLoader: boolean
  shouldDisable: boolean
  positionData: {
    position: PositionWithAddress | null
    loading: boolean
  }
  positionListSwitcher: LiquidityPools
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
  isLocked: boolean
  position: Position
  lowerTick: Tick
  upperTick: Tick
}

export interface UpdatePositionRangeRicksData {
  positionId: string
  fetchTick?: FetchTick
}

export enum LiquidityPools {
  Standard = 'Standard',
  Locked = 'Locked'
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
  initPosition: {
    inProgress: false,
    success: false
  },
  prices: {
    data: {}
  },
  shouldDisable: false,
  shouldNotUpdateRange: false,
  showFeesLoader: false,
  positionData: {
    position: null,
    loading: false
  },
  positionListSwitcher: LiquidityPools.Standard
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
    setShouldDisable(state, action: PayloadAction<boolean>) {
      state.shouldDisable = action.payload
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
    setPosition(state, action: PayloadAction<PositionWithAddress | null>) {
      state.positionData.position = action.payload
      state.positionData.loading = false
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
    getPreviewPosition(state, _action: PayloadAction<string>) {
      state.positionData.loading = true
      return state
    },
    getSinglePosition(state, action: PayloadAction<{ index: number; isLocked: boolean }>) {
      const targetList = action.payload.isLocked
        ? state.positionsList.lockedList
        : state.positionsList.list

      if (targetList[action.payload.index]) {
        targetList[action.payload.index].ticksLoading = true
      }

      return state
    },
    setSinglePosition(state, action: PayloadAction<SetPositionData>) {
      action.payload.isLocked
        ? (state.positionsList.lockedList[action.payload.index] = {
            address: state.positionsList.lockedList[action.payload.index].address,
            lowerTick: action.payload.lowerTick,
            upperTick: action.payload.upperTick,
            ticksLoading: false,
            ...action.payload.position
          })
        : (state.positionsList.list[action.payload.index] = {
            address: state.positionsList.list[action.payload.index].address,
            lowerTick: action.payload.lowerTick,
            upperTick: action.payload.upperTick,
            ticksLoading: false,
            ...action.payload.position
          })
      return state
    },
    claimFee(state, _action: PayloadAction<{ index: number; isLocked: boolean }>) {
      state.showFeesLoader = true
      return state
    },
    setFeesLoader(state, action: PayloadAction<boolean>) {
      state.showFeesLoader = action.payload
      return state
    },
    claimAllFee(state) {
      return state
    },
    closePosition(state, _action: PayloadAction<ClosePositionData>) {
      return state
    },
    resetState() {
      return defaultState
    },
    setShouldNotUpdateRange(state, action: PayloadAction<boolean>) {
      state.shouldNotUpdateRange = action.payload
      return state
    },
    setCurrentPositionId(state, action: PayloadAction<string>) {
      state.currentPositionId = action.payload
      return state
    },
    setPositionListSwitcher(state, action: PayloadAction<LiquidityPools>) {
      state.positionListSwitcher = action.payload
      return state
    }
  }
})

export const actions = positionsSlice.actions
export const reducer = positionsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
