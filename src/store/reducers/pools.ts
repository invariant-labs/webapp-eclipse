import { Token } from '@consts/static'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { PoolStructure, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import { Tick } from '@invariant-labs/sdk-eclipse/src/market'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicKey } from '@solana/web3.js'
import { PayloadType } from './types'
import * as R from 'remeda'
import { Range } from '@invariant-labs/sdk-eclipse/lib/utils'

export interface PoolWithAddress extends PoolStructure {
  address: PublicKey
}

export interface IPoolsStore {
  tokens: Record<string, Token>
  pools: { [key in string]: PoolWithAddress }
  poolTicks: { [key in string]: Tick[] }
  nearestPoolTicksForPair: { [key in string]: Tick[] }
  isLoadingLatestPoolsForTransaction: boolean
  tickMaps: { [key in string]: Tickmap }
  volumeRanges: Record<string, Range[]>
}

export interface UpdatePool {
  address: PublicKey
  poolStructure: PoolStructure
}

export interface updateTickMaps {
  index: string
  tickMapStructure: Tickmap
}

export interface UpdateTick {
  index: string
  tickStructure: Tick[]
}
export interface DeleteTick {
  address: string
  index: number
}
export interface UpdateTicks extends DeleteTick {
  tick: Tick
}

export interface UpdateTickmap {
  address: string
  bitmap: number[]
}

export interface FetchTicksAndTickMaps {
  tokenFrom: PublicKey
  tokenTo: PublicKey
  allPools: PoolWithAddress[]
}

export const defaultState: IPoolsStore = {
  tokens: {},
  pools: {},
  poolTicks: {},
  nearestPoolTicksForPair: {},
  isLoadingLatestPoolsForTransaction: false,
  tickMaps: {},
  volumeRanges: {}
}

export interface PairTokens {
  first: PublicKey
  second: PublicKey
}

export enum ListType {
  POSITIONS,
  FARMS
}

export interface ListPoolsRequest {
  addresses: string[]
  listType: ListType
}

export interface ListPoolsResponse {
  data: PoolWithAddress[]
  listType: ListType
}

export const poolsSliceName = 'pools'
const poolsSlice = createSlice({
  name: poolsSliceName,
  initialState: defaultState,
  reducers: {
    addTokens(state, action: PayloadAction<Record<string, Token>>) {
      state.tokens = {
        ...state.tokens,
        ...action.payload
      }
      return state
    },
    setVolumeRanges(state, action: PayloadAction<Record<string, Range[]>>) {
      state.volumeRanges = action.payload
      return state
    },
    setPools(state, action: PayloadAction<{ [key in string]: PoolWithAddress }>) {
      state.pools = action.payload
      return state
    },
    setTickMaps(state, action: PayloadAction<updateTickMaps>) {
      state.tickMaps[action.payload.index] = action.payload.tickMapStructure
    },
    setTicks(state, action: PayloadAction<UpdateTick>) {
      state.poolTicks[action.payload.index] = action.payload.tickStructure
      return state
    },
    updatePool(state, action: PayloadAction<UpdatePool>) {
      state.pools[action.payload.address.toString()] = {
        address: state.pools[action.payload.address.toString()].address,
        ...action.payload.poolStructure
      }
      return state
    },
    addPools(state, action: PayloadAction<PoolWithAddress[]>) {
      const newData = action.payload.reduce(
        (acc, pool) => ({
          ...acc,
          [pool.address.toString()]: pool
        }),
        {}
      )
      state.pools = R.merge(state.pools, newData)
      state.isLoadingLatestPoolsForTransaction = false
      return state
    },
    addPoolsForList(state, action: PayloadAction<ListPoolsResponse>) {
      const newData = action.payload.data.reduce(
        (acc, pool) => ({
          ...acc,
          [pool.address.toString()]: pool
        }),
        {}
      )
      state.pools = R.merge(state.pools, newData)
      return state
    },
    updateTicks(state, action: PayloadAction<UpdateTicks>) {
      state.poolTicks[action.payload.address][
        state.poolTicks[action.payload.address].findIndex(e => e.index === action.payload.index)
      ] = action.payload.tick
    },
    getPoolData(state, _action: PayloadAction<Pair>) {
      state.isLoadingLatestPoolsForTransaction = true

      return state
    },
    getAllPoolsForPairData(state, _action: PayloadAction<PairTokens>) {
      state.isLoadingLatestPoolsForTransaction = true

      return state
    },
    getPoolsDataForList(_state, _action: PayloadAction<ListPoolsRequest>) {},
    deleteTick(state, action: PayloadAction<DeleteTick>) {
      state.poolTicks[action.payload.address].splice(action.payload.index, 1)
    },
    updateTickmap(state, action: PayloadAction<UpdateTickmap>) {
      state.tickMaps[action.payload.address].bitmap = action.payload.bitmap
    },
    getTicksAndTickMaps(_state, _action: PayloadAction<FetchTicksAndTickMaps>) {
      return _state
    },
    addTicksToArray(state, action: PayloadAction<UpdateTick>) {
      const { index, tickStructure } = action.payload
      if (!state.poolTicks[index]) {
        state.poolTicks[index] = []
      }
      state.poolTicks[index] = [...state.poolTicks[index], ...tickStructure]
    },
    setNearestTicksForPair(state, action: PayloadAction<UpdateTick>) {
      state.nearestPoolTicksForPair[action.payload.index] = action.payload.tickStructure
      return state
    },
    getNearestTicksForPair(_state, _action: PayloadAction<FetchTicksAndTickMaps>) {}
  }
})

export const actions = poolsSlice.actions
export const reducer = poolsSlice.reducer
export type PayloadTypes = PayloadType<typeof actions>
