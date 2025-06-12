import { actions } from '@store/reducers/stats'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { PublicKey } from '@solana/web3.js'
import { getConnection, handleRpcError } from './connection'
import { ensureError, getIntervalsFullSnap, getTokenPrice, printBN } from '@utils/utils'
import { lastInterval, lastTimestamp } from '@store/selectors/stats'
import { Intervals, STATS_CACHE_TIME } from '@store/consts/static'
import { PayloadAction } from '@reduxjs/toolkit'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { getWallet } from './wallet'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { dailyFactorPool, DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

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

    // @ts-ignore
    const tokenXAmount = reserve.value[0]?.data?.parsed?.info?.tokenAmount
    // @ts-ignore
    const tokenYAmount = reserve.value[1]?.data?.parsed?.info?.tokenAmount

    let volumeX = 0
    let volumeY = 0

    if (tokenXPrice) {
      volumeX = tokenXPrice * +printBN(currentVolumeX, tokenXAmount.decimals)
    }

    if (tokenYPrice) {
      volumeY = tokenYPrice * +printBN(currentVolumeY, tokenYAmount.decimals)
    }
    const volume = volumeX + volumeY

    let tokenXTvl = 0
    let tokenYtvl = 0
    if (tokenXPrice && tokenXAmount.uiAmount) {
      tokenXTvl = tokenXPrice * tokenXAmount.uiAmount
    }
    if (tokenYPrice && tokenYAmount.uiAmount) {
      tokenYtvl = tokenYPrice * tokenYAmount.uiAmount
    }
    const tvl = tokenXTvl + tokenYtvl

    const feeTier = { fee: pool.fee, tickSpacing: pool.tickSpacing }

    const dailyFactor = dailyFactorPool(new BN(tvl), volume, feeTier)

    const APY = (Math.pow(dailyFactor + 1, 365) - 1) * 100

    yield* put(
      actions.setPoolStatsData({
        apy: APY === Infinity ? 1001 : isNaN(+JSON.stringify(APY)) ? 0 : APY,
        fee: +printBN(pool.fee, DECIMAL - 2).toString(),
        poolAddress: pool.address,
        volume24: volume,
        tokenX: pair.tokenX,
        tokenY: pair.tokenY,
        liquidityX: tokenXAmount.amount,
        liquidityY: tokenYAmount.amount,
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
