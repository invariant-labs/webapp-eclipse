import { call, put, all, spawn, takeEvery, takeLatest, select } from 'typed-redux-saga'
import { getMarketProgram } from '@web3/programs/amm'
import { Pair } from '@invariant-labs/sdk-eclipse'
import {
  actions,
  FetchTicksAndTickMaps,
  ListPoolsRequest,
  PairTokens,
  PoolWithAddress
} from '@reducers/pools'
import { PayloadAction } from '@reduxjs/toolkit'
import { Tick } from '@invariant-labs/sdk-eclipse/src/market'
import { PublicKey } from '@solana/web3.js'
import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'
import { findPairs, getFullNewTokensData, getPools, getPoolsFromAdresses } from '@consts/utils'
import { tokens } from '@selectors/pools'
import { getConnection } from './connection'
import { network, rpcAddress } from '@selectors/solanaConnection'
import { sleep } from './wallet'

export interface iTick {
  index: Tick[]
}

export function* fetchPoolData(action: PayloadAction<Pair>) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc)
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
  } catch (error) {
    yield* put(actions.addPools([]))
  }
}

export function* fetchAllPoolsForPairData(action: PayloadAction<PairTokens>) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc)
  const pairs = FEE_TIERS.map(fee => new Pair(action.payload.first, action.payload.second, fee))
  const pools: PoolWithAddress[] = yield call(getPools, pairs, marketProgram)

  yield* put(actions.addPools(pools))
}

export function* fetchPoolsDataForList(action: PayloadAction<ListPoolsRequest>) {
  const connection = yield* call(getConnection)
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc)
  const newPools: PoolWithAddress[] = yield* call(
    getPoolsFromAdresses,
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
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const pools = findPairs(tokenFrom, tokenTo, allPools)

    yield* call(fetchTickMaps, pools)

    for (const pool of pools) {
      const ticks = yield* call(
        [marketProgram, marketProgram.getAllTicks],
        new Pair(tokenFrom, tokenTo, { fee: pool.fee.v, tickSpacing: pool.tickSpacing })
      )

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
  } catch (error) {
    console.log(error)
  }
}

function* fetchTickMaps(pools: PoolWithAddress[]) {
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc)

  const allTickMaps = yield* all([
    ...pools.map(pool =>
      call(
        [marketProgram, marketProgram.getTickmap],
        new Pair(pool.tokenX, pool.tokenY, { fee: pool.fee.v, tickSpacing: pool.tickSpacing })
      )
    )
  ])

  for (let i = 0; i < pools.length; i++) {
    yield* put(
      actions.setTickMaps({
        index: pools[i].tickmap.toString(),
        tickMapStructure: allTickMaps[i]
      })
    )
  }
}

export function* fetchNearestTicksForPair(action: PayloadAction<FetchTicksAndTickMaps>) {
  const { tokenFrom, tokenTo, allPools } = action.payload
  enum IsXtoY {
    Up = 'up',
    Down = 'down'
  }

  try {
    const networkType = yield* select(network)
    const rpc = yield* select(rpcAddress)
    const marketProgram = yield* call(getMarketProgram, networkType, rpc)

    const pools = findPairs(tokenFrom, tokenTo, allPools)

    yield* call(fetchTickMaps, pools)

    const results = yield* all([
      ...pools.map(pool => {
        const isXtoY = tokenFrom.equals(pool.tokenX)
        return call(
          [marketProgram, marketProgram.getClosestTicks],
          new Pair(tokenFrom, tokenTo, { fee: pool.fee.v, tickSpacing: pool.tickSpacing }),
          21,
          undefined,
          isXtoY ? IsXtoY.Down : IsXtoY.Up
        )
      })
    ])

    if (results.length > 0) {
      for (let i = 0; i < pools.length; i++) {
        yield* put(
          actions.setNearestTicksForPair({
            index: pools[i].address.toString(),
            tickStructure: results[i]
          })
        )
      }
    }
  } catch (error) {
    console.log(error)
  }
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

export function* getTicksAndTickMapsHandler(): Generator {
  yield* takeEvery(actions.getTicksAndTickMaps, fetchTicksAndTickMaps)
}

export function* getNearestTicksForPairHandler(): Generator {
  yield* takeEvery(actions.getNearestTicksForPair, fetchNearestTicksForPair)
}

export function* poolsSaga(): Generator {
  yield all(
    [
      getPoolDataHandler,
      getAllPoolsForPairDataHandler,
      getPoolsDataForListHandler,
      getTicksAndTickMapsHandler,
      getNearestTicksForPairHandler
    ].map(spawn)
  )
}
