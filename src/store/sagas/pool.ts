import { call, put, all, spawn, takeEvery, takeLatest, select } from 'typed-redux-saga'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { PayloadAction } from '@reduxjs/toolkit'
import { Tick, TICK_CROSSES_PER_IX } from '@invariant-labs/sdk-eclipse/src/market'
import { PublicKey } from '@solana/web3.js'
import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'
import { getConnection, handleRpcError } from './connection'
import { getWallet, sleep } from './wallet'
import { getMarketProgram } from '@utils/web3/programs/amm'
import {
  actions,
  FetchTicksAndTickMaps,
  IFetchTicksAndTickMapForAutoSwap,
  ListPoolsRequest,
  PairTokens,
  PoolWithAddress
} from '@store/reducers/pools'
import { tokens } from '@store/selectors/pools'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import {
  ensureError,
  findPairs,
  getFullNewTokensData,
  getPools,
  getPoolsFromAddresses,
  getTickmapsFromPools,
  getTicksFromAddresses,
  hasLuts
} from '@utils/utils'
import { parseTick } from '@invariant-labs/sdk-eclipse/lib/market'
import { MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS } from '@store/consts/static'

export interface iTick {
  index: Tick[]
}

export function* fetchPoolData(action: PayloadAction<Pair>) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
  try {
    const poolData = yield* call([marketProgram, marketProgram.getPool], action.payload)
    const address = yield* call(
      [action.payload, action.payload.getAddress],
      marketProgram.program.programId
    )

    yield* put(
      actions.addPools([
        {
          ...poolData,
          address
        }
      ])
    )
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.addPools([]))

    yield* call(handleRpcError, error.message)
  }
}

export function* fetchAutoSwapPoolData(action: PayloadAction<Pair>) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
  try {
    const poolData = yield* call([marketProgram, marketProgram.getPool], action.payload)
    const address = action.payload.getAddress(marketProgram.program.programId)

    yield* put(
      actions.setAutoSwapPoolData({
        ...poolData,
        address
      })
    )
    yield* put(actions.setIsLoadingAutoSwapPool(false))
  } catch (error) {
    yield* put(actions.setAutoSwapPoolData(null))
    yield* put(actions.setIsLoadingAutoSwapPool(false))
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* fetchAllPoolsForPairData(action: PayloadAction<PairTokens>) {
  try {
    const networkType = yield* select(network)

    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const pairs = FEE_TIERS.map(fee => new Pair(action.payload.first, action.payload.second, fee))

    const pools: PoolWithAddress[] = yield call(getPools, pairs, marketProgram)

    yield* put(actions.addPools(pools))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
  }
}

export function* fetchPoolsDataForList(action: PayloadAction<ListPoolsRequest>) {
  const connection = yield* call(getConnection)
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

  const newPools: PoolWithAddress[] = yield* call(
    getPoolsFromAddresses,
    action.payload.addresses.map(addr => new PublicKey(addr)),
    marketProgram
  )

  const allTokens = yield* select(tokens)
  const unknownTokens = new Set<PublicKey>()

  newPools.forEach(pool => {
    if (!allTokens[pool.tokenX.toString()]) {
      unknownTokens.add(pool.tokenX)
    }

    if (!allTokens[pool.tokenY.toString()]) {
      unknownTokens.add(pool.tokenY)
    }
  })

  const newTokens = yield* call(getFullNewTokensData, [...unknownTokens], connection)
  yield* put(actions.addTokens(newTokens))

  yield* put(
    actions.addPoolsForList({
      data: newPools,
      listType: action.payload.listType
    })
  )
}

export function* fetchTicksAndTickMaps(action: PayloadAction<FetchTicksAndTickMaps>) {
  const { tokenFrom, tokenTo, allPools } = action.payload

  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const pools = findPairs(tokenFrom, tokenTo, allPools)

    const { allTickMaps, allTicks } = yield* all({
      allTickMaps: all([
        ...pools.map(pool =>
          call(
            [marketProgram, marketProgram.getTickmap],
            new Pair(pool.tokenX, pool.tokenY, { fee: pool.fee, tickSpacing: pool.tickSpacing })
          )
        )
      ]),
      allTicks: all([
        ...pools.map(pool =>
          call(
            [marketProgram, marketProgram.getAllTicks],
            new Pair(pool.tokenX, pool.tokenY, { fee: pool.fee, tickSpacing: pool.tickSpacing })
          )
        )
      ])
    })

    for (let i = 0; i < pools.length; i++) {
      yield* put(
        actions.setTickMaps({
          index: pools[i].tickmap.toString(),
          tickMapStructure: allTickMaps[i]
        })
      )
    }

    const allTicksDict: Record<string, Tick[]> = {}
    for (let i = 0; i < pools.length; i++) {
      allTicksDict[pools[i].address.toString()] = allTicks[i]
    }

    for (const pool of pools) {
      const ticks = allTicksDict[pool.address.toString()]

      if (ticks.length > 300) {
        yield* put(actions.setTicks({ index: pool.address.toString(), tickStructure: [] }))
        for (let i = 0; i < ticks.length; i += 100) {
          yield* call(sleep, 100)
          const chunk = ticks.slice(i, i + 100)
          yield* put(
            actions.addTicksToArray({ index: pool.address.toString(), tickStructure: chunk })
          )
        }
      } else {
        yield* put(actions.setTicks({ index: pool.address.toString(), tickStructure: ticks }))
      }
    }
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
  }
}
export function* fetchNearestTicksForPair(action: PayloadAction<FetchTicksAndTickMaps>) {
  const { tokenFrom, tokenTo, allPools } = action.payload

  if (tokenFrom.equals(PublicKey.default) || tokenTo.equals(PublicKey.default)) {
    return
  }

  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
    const pools = findPairs(tokenFrom, tokenTo, allPools)

    const tickmaps = yield* call(getTickmapsFromPools, pools, marketProgram)

    const batchSize = TICK_CROSSES_PER_IX + 3
    const tickAddresses: PublicKey[][] = pools.map(pool => {
      const isXtoY = tokenFrom.equals(pool.tokenX)
      const pair = new Pair(tokenFrom, tokenTo, {
        fee: pool.fee,
        tickSpacing: pool.tickSpacing
      })

      return marketProgram.findTickAddressesForSwap(
        pair,
        pool,
        tickmaps[pool.tickmap.toBase58()],
        isXtoY,
        hasLuts(pool.address) ? MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS + 1 : batchSize
      )
    })

    const ticks = yield* call(getTicksFromAddresses, marketProgram, tickAddresses.flat())

    let offset = 0
    for (let i = 0; i < tickAddresses.length; i++) {
      const ticksInPool = tickAddresses[i].length
      yield* put(
        actions.setNearestTicksForPair({
          index: pools[i].address.toString(),
          tickStructure: ticks
            .slice(offset, offset + ticksInPool)
            .filter(t => !!t)
            .map(t => parseTick(t))
        })
      )
      offset += ticksInPool

      const tickmapKey = pools[i].tickmap.toBase58()
      if (tickmaps[tickmapKey]) {
        yield* put(
          actions.updateTickmap({
            address: tickmapKey,
            bitmap: tickmaps[tickmapKey].bitmap
          })
        )
      }
    }
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* call(handleRpcError, error.message)
  }
}

export function* fetchTicksAndTickMapForAutoSwap(
  action: PayloadAction<IFetchTicksAndTickMapForAutoSwap>
) {
  const { tokenFrom, tokenTo, autoSwapPool } = action.payload
  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const wallet = yield* call(getWallet)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)

    const pair = new Pair(tokenFrom, tokenTo, {
      fee: autoSwapPool.fee,
      tickSpacing: autoSwapPool.tickSpacing
    })

    const tickmap = yield call([marketProgram, marketProgram.getTickmap], pair)

    const batchSize = TICK_CROSSES_PER_IX + 3

    const tickAddresses: PublicKey[] = [
      ...marketProgram.findTickAddressesForSwap(pair, autoSwapPool, tickmap, true, batchSize),
      ...marketProgram.findTickAddressesForSwap(pair, autoSwapPool, tickmap, false, batchSize)
    ]

    const ticks = yield* call(getTicksFromAddresses, marketProgram, tickAddresses)

    const parsedTicks = ticks.filter(t => !!t).map(t => parseTick(t))

    yield* put(actions.setAutoSwapTicksAndTickMap({ ticks: parsedTicks, tickmap }))
    yield* put(actions.setIsLoadingAutoSwapPoolTicksOrTickMap(false))
  } catch (error) {
    yield* put(actions.setIsLoadingAutoSwapPoolTicksOrTickMap(false))
    console.log(error)
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* handleGetPathTokens(action: PayloadAction<string[]>) {
  const tokens = action.payload

  const connection = yield* getConnection()

  try {
    const tokensData = yield* call(
      getFullNewTokensData,
      tokens.map(token => new PublicKey(token)),
      connection
    )

    yield* put(actions.addPathTokens(tokensData))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setTokensError(true))
  }
}

export function* getTicksAndTickMapForAutoSwapHandler(): Generator {
  yield* takeLatest(actions.getTicksAndTickMapForAutoSwap, fetchTicksAndTickMapForAutoSwap)
}

export function* getPoolsDataForListHandler(): Generator {
  yield* takeEvery(actions.getPoolsDataForList, fetchPoolsDataForList)
}

export function* getAllPoolsForPairDataHandler(): Generator {
  yield* takeLatest(actions.getAllPoolsForPairData, fetchAllPoolsForPairData)
}

export function* getPoolDataHandler(): Generator {
  yield* takeLatest(actions.getPoolData, fetchPoolData)
}

export function* getAutoSwapPoolDataHandler(): Generator {
  yield* takeLatest(actions.getAutoSwapPoolData, fetchAutoSwapPoolData)
}

export function* getTicksAndTickMapsHandler(): Generator {
  yield* takeEvery(actions.getTicksAndTickMaps, fetchTicksAndTickMaps)
}

export function* getNearestTicksForPairHandler(): Generator {
  yield* takeEvery(actions.getNearestTicksForPair, fetchNearestTicksForPair)
}

export function* getPathTokensHandler(): Generator {
  yield* takeLatest(actions.getPathTokens, handleGetPathTokens)
}

export function* poolsSaga(): Generator {
  yield all(
    [
      getPoolDataHandler,
      getAllPoolsForPairDataHandler,
      getPoolsDataForListHandler,
      getTicksAndTickMapsHandler,
      getNearestTicksForPairHandler,
      getPathTokensHandler,
      getAutoSwapPoolDataHandler,
      getTicksAndTickMapForAutoSwapHandler
    ].map(spawn)
  )
}
