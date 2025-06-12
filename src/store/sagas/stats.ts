import { actions } from '@store/reducers/stats'
import { all, call, put, select, spawn, takeLatest } from 'typed-redux-saga'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { PublicKey } from '@solana/web3.js'
import { handleRpcError } from './connection'
import { ensureError, getIntervalsFullSnap } from '@utils/utils'
import { lastInterval, lastTimestamp } from '@store/selectors/stats'
import { Intervals, STATS_CACHE_TIME } from '@store/consts/static'
import { PayloadAction } from '@reduxjs/toolkit'
import { IWallet, Pair, PRICE_DENOMINATOR } from '@invariant-labs/sdk-eclipse'
import { getWallet } from './wallet'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { arithmeticalAvg, dailyFactorPool } from '@invariant-labs/sdk-eclipse/lib/utils'

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
  try {
    const { volumeX: currentVolumeX, volumeY: currentVolumeY } = yield* call(
      marketProgram.getVolume,
      pair,
      pool
    )

    const currentSqrtPrice = pool.sqrtPrice
    const price = currentSqrtPrice.mul(currentSqrtPrice).div(PRICE_DENOMINATOR)

    const currentVolumeXBN = new BN(currentVolumeX)

    const currentVolumeYBN = new BN(currentVolumeY)
    console.log(currentVolumeX.toString())
    console.log(currentVolumeY.toString())
    const denominatedVolumeY = new BN(currentVolumeYBN).mul(PRICE_DENOMINATOR).div(price)

    const volume = Math.abs(currentVolumeXBN.add(denominatedVolumeY).toNumber())

    const denominatedLpY = PRICE_DENOMINATOR.div(price)

    const currentXamount = denominatedLpY
    const previousXAmount = new BN(0)
    const avgTvl = previousXAmount.eqn(0)
      ? currentXamount
      : arithmeticalAvg(currentXamount, previousXAmount)

    const feeTier = { fee: pool.fee, tickSpacing: pool.tickSpacing }
    const dailyFactor = dailyFactorPool(avgTvl, volume, feeTier)

    const APY = (Math.pow(dailyFactor + 1, 365) - 1) * 100

    yield* put(
      actions.setPoolStatsData({
        apy: APY,
        fee: pool.fee,
        poolAddress: pool.address,
        volume24: volume,
        tokenX: pair.tokenX,
        tokenY: pair.tokenY,
        liquidityX: 0,
        liquidityY: 0,
        lockedX: 0,
        lockedY: 0,
        tvl: avgTvl
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
