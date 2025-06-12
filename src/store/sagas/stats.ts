import { actions } from '@store/reducers/stats'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { PublicKey } from '@solana/web3.js'
import { getConnection, handleRpcError } from './connection'
import {
  ensureError,
  getIntervalsFullSnap,
  getTokenPrice,
  parseFeeToPathFee,
  printBN
} from '@utils/utils'
import { lastInterval, lastTimestamp } from '@store/selectors/stats'
import { Intervals, STATS_CACHE_TIME } from '@store/consts/static'
import { PayloadAction } from '@reduxjs/toolkit'
import { IWallet, Pair, PRICE_DENOMINATOR } from '@invariant-labs/sdk-eclipse'
import { getWallet } from './wallet'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { arithmeticalAvg, dailyFactorPool, DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { token } from '@metaplex-foundation/js'

// export function* getStats(): Generator {
//   try {
//     const lastFetchTimestamp = yield* select(lastTimestamp)

//     if (+Date.now() < lastFetchTimestamp + STATS_CACHE_TIME) {
//       return yield* put(actions.setLoadingStats(false))
//     }

//     const currentNetwork = yield* select(network)

//     const fullSnap = yield* call(getFullSnap, currentNetwork.toLowerCase())
//     const parsedFullSnap = {
//       ...fullSnap,
//       tokensData: fullSnap.tokensData.map(token => ({
//         ...token,
//         address: new PublicKey(token.address)
//       })),
//       poolsData: fullSnap.poolsData.map(pool => ({
//         ...pool,
//         poolAddress: new PublicKey(pool.poolAddress),
//         tokenX: new PublicKey(pool.tokenX),
//         tokenY: new PublicKey(pool.tokenY)
//       }))
//     }

//     // @ts-expect-error FIXME: Interface missmatch.
//     yield* put(actions.setCurrentStats(parsedFullSnap, Intervals.Daily))
//   } catch (e: unknown) {
//     const error = ensureError(e)
//     console.log(error)

//     yield* put(actions.setLoadingStats(false))

//     yield* call(handleRpcError, error.message)
//   }
// }

export function* getIntervalStats(action: PayloadAction<{ interval: Intervals }>): Generator {
  try {
    const lastFetchTimestamp = yield* select(lastTimestamp)
    const lastFetchInterval = yield* select(lastInterval)

    if (
      +Date.now() < lastFetchTimestamp + STATS_CACHE_TIME &&
      lastFetchInterval === action.payload.interval
    ) {
      return yield* put(actions.setLoadingStats(false))
    }

    const currentNetwork = yield* select(network)

    const fullSnap = yield* call(
      getIntervalsFullSnap,
      currentNetwork.toLowerCase(),
      action.payload.interval
    )

    const parsedFullSnap = {
      ...fullSnap,
      // @ts-expect-error FIXME: Interface missmatch.
      lastSnapTimestamp: fullSnap.timestamp,
      volumePlot: fullSnap.volumePlot.reverse(),
      liquidityPlot: fullSnap.liquidityPlot.reverse(),
      tokensData: fullSnap.tokensData.map(token => ({
        ...token,
        address: new PublicKey(token.address),
        //@ts-expect-error FIXME: Interface missmatch.
        volume24: token.volume
      })),
      poolsData: fullSnap.poolsData.map(pool => ({
        ...pool,
        poolAddress: new PublicKey(pool.poolAddress),
        tokenX: new PublicKey(pool.tokenX),
        tokenY: new PublicKey(pool.tokenY),
        //@ts-expect-error FIXME: Interface missmatch.
        volume24: pool.volume
      }))
    }

    const payload = {
      ...parsedFullSnap,
      lastInterval: action.payload.interval
    }
    // @ts-expect-error FIXME: Interface missmatch.
    yield* put(actions.setCurrentStats(payload))
  } catch (e: unknown) {
    const error = ensureError(e)
    console.log(error)

    yield* put(actions.setLoadingStats(false))

    yield* call(handleRpcError, error.message)
  }
}

export function* getPoolStats(
  action: PayloadAction<{ pair: Pair; pool: PoolWithAddress }>
): Generator {
  const { pair, pool } = action.payload
  const networkType = yield* select(network)
  const rpc = yield* select(rpcAddress)
  const wallet = yield* call(getWallet)
  const marketProgram = yield* call(getMarketProgram, networkType, rpc, wallet as IWallet)
  const connection = yield* call(getConnection)
  try {
    const { volumeX: currentVolumeX, volumeY: currentVolumeY } = yield* call(
      [marketProgram, marketProgram.getVolume],
      pair,
      pool
    )

    const reserve = yield* call(
      [connection, connection.getMultipleParsedAccounts],
      [pool.tokenXReserve, pool.tokenYReserve]
    )

    const tokenXPrice = yield* call(getTokenPrice, pair.tokenX.toString(), networkType)
    const tokenYPrice = yield* call(getTokenPrice, pair.tokenY.toString(), networkType)

    let volumeX = new BN(0)
    let volumeY = new BN(0)

    if (tokenXPrice) {
      volumeX = new BN(tokenXPrice).mul(currentVolumeX)
    }
    if (tokenYPrice) {
      volumeY = new BN(tokenYPrice).mul(currentVolumeY)
    }
    const volume = +volumeX.add(volumeY).toString()

    // @ts-ignore
    const tokenXLiquidity = reserve.value[0]?.data?.parsed?.info?.tokenAmount?.amount
    // @ts-ignore
    const tokenYLiquidity = reserve.value[1]?.data?.parsed?.info?.tokenAmount?.amount

    // @ts-ignore
    const tokenXAmount = reserve.value[0]?.data?.parsed?.info?.tokenAmount?.uiAmount
    // @ts-ignore
    const tokenYAmount = reserve.value[1]?.data?.parsed?.info?.tokenAmount?.uiAmount

    let tokenXTvl = 0
    let tokenYtvl = 0
    if (tokenXPrice && tokenXAmount) {
      tokenXTvl = tokenXPrice * tokenXAmount
    }
    if (tokenYPrice && tokenYAmount) {
      tokenYtvl = tokenYPrice * tokenYAmount
    }
    const tvl = tokenXTvl + tokenYtvl

    const feeTier = { fee: pool.fee, tickSpacing: pool.tickSpacing }
    const dailyFactor = dailyFactorPool(new BN(tokenXLiquidity), volume, feeTier)

    const apy = (Math.pow(dailyFactor + 1, 365) - 1) * 100

    yield* put(
      actions.setPoolStatsData({
        apy,
        fee: +printBN(pool.fee, DECIMAL - 2).toString(),
        poolAddress: pool.address,
        volume24: volume,
        tokenX: pair.tokenX,
        tokenY: pair.tokenY,
        liquidityX: tokenXLiquidity,
        liquidityY: tokenYLiquidity,
        lockedX: 0,
        lockedY: 0,
        tvl: tvl
      })
    )
  } catch (e: unknown) {
    console.log(e)
  }
}

export function* intervalStatsHandler(): Generator {
  yield* takeLatest(actions.getCurrentIntervalStats, getIntervalStats)
}

export function* poolStatsHandler(): Generator {
  yield* takeLatest(actions.getPoolStatsData, getPoolStats)
}

export function* statsSaga(): Generator {
  yield* all([intervalStatsHandler, poolStatsHandler].map(spawn))
}
