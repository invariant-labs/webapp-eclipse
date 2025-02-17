import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { rpcAddress, network } from '@store/selectors/solanaConnection'
import { printBN } from '@utils/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { getEclipseWallet } from '@utils/web3/wallet'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'

const UPDATE_INTERVAL = 60000
export const useCalculateUnclaimedFee = (positionList: any, prices: Record<string, number>) => {
  const rpc = useSelector(rpcAddress)
  const networkType = useSelector(network)
  const [totalUnclaimedFee, setTotalUnclaimedFee] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const lastUpdateTimeRef = useRef<number>(0)
  const marketProgramRef = useRef<any>(null)
  const walletRef = useRef<IWallet | null>(null)

  const initializeProgram = useCallback(async () => {
    if (!walletRef.current) {
      walletRef.current = getEclipseWallet() as IWallet
    }

    if (!marketProgramRef.current) {
      marketProgramRef.current = await getMarketProgram(networkType, rpc, walletRef.current)
    }

    return marketProgramRef.current
  }, [networkType, rpc])

  const ticksCache = useRef<Map<string, any>>(new Map())

  const getTickCacheKey = useCallback((pair: Pair, tickIndex: number) => {
    return `${pair.tokenX.toString()}-${pair.tokenY.toString()}-${tickIndex}`
  }, [])

  const getTickWithCache = useCallback(
    async (marketProgram: any, pair: Pair, tickIndex: number) => {
      const cacheKey = getTickCacheKey(pair, tickIndex)

      if (ticksCache.current.has(cacheKey)) {
        return ticksCache.current.get(cacheKey)
      }

      const tick = await marketProgram.getTick(pair, tickIndex)
      ticksCache.current.set(cacheKey, tick)
      return tick
    },
    [getTickCacheKey]
  )

  const calculateUnclaimedFee = useCallback(async () => {
    const currentTime = Date.now()
    if (!isInitialLoad && currentTime - lastUpdateTimeRef.current < UPDATE_INTERVAL) {
      return
    }

    try {
      const marketProgram = await initializeProgram()

      const ticks = await Promise.all(
        positionList.map(async (position: any) => {
          const pair = new Pair(position.poolData.tokenX, position.poolData.tokenY, {
            fee: position.poolData.fee,
            tickSpacing: position.poolData.tickSpacing
          })

          return Promise.all([
            getTickWithCache(marketProgram, pair, position.lowerTickIndex),
            getTickWithCache(marketProgram, pair, position.upperTickIndex)
          ])
        })
      )

      const total = positionList.reduce((acc: number, position: any, i: number) => {
        const [lowerTick, upperTick] = ticks[i]
        const [bnX, bnY] = calculateClaimAmount({
          position,
          tickLower: lowerTick,
          tickUpper: upperTick,
          tickCurrent: position.poolData.currentTickIndex,
          feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
          feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
        })

        const xValue =
          +printBN(bnX, position.tokenX.decimals) *
          (prices[position.tokenX.assetAddress.toString()] ?? 0)
        const yValue =
          +printBN(bnY, position.tokenY.decimals) *
          (prices[position.tokenY.assetAddress.toString()] ?? 0)

        return acc + xValue + yValue
      }, 0)

      setTotalUnclaimedFee(isFinite(total) ? total : 0)
      lastUpdateTimeRef.current = currentTime
      setIsInitialLoad(false)
    } catch (error) {
      console.error('Error calculating unclaimed fees:', error)
      setTotalUnclaimedFee(0)
    }
  }, [positionList, prices, initializeProgram, getTickWithCache, isInitialLoad])

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      calculateUnclaimedFee()

      const interval = setInterval(() => {
        calculateUnclaimedFee()
      }, UPDATE_INTERVAL)

      return () => {
        clearInterval(interval)
        ticksCache.current.clear()
      }
    }
  }, [calculateUnclaimedFee, prices])

  useEffect(() => {
    marketProgramRef.current = null
    ticksCache.current.clear()
  }, [networkType, rpc])

  return totalUnclaimedFee
}
