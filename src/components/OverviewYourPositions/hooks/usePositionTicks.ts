import { useState, useCallback } from 'react'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'

import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { printBN } from '@utils/utils'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { NetworkType } from '@store/consts/static'
import { getEclipseWallet } from '@utils/web3/wallet'

interface TickData {
  lower: Tick
  upper: Tick
  lowerIndex: number
  upperIndex: number
  poolAddress: string
}

interface PositionTicksMap {
  [positionId: string]: TickData
}

interface UsePositionTicksReturn {
  positionTicks: PositionTicksMap
  isLoading: boolean
  error: Error | null
  fetchPositionTicks: (
    positionId: string,
    poolData: any,
    lowerTickIndex: number,
    upperTickIndex: number
  ) => Promise<void>
  calculateFeesForPosition: (positionId: string, position: any) => [number, number] | null
}

export const usePositionTicks = (
  networkType: NetworkType,
  rpcAddress: string
): UsePositionTicksReturn => {
  const [positionTicks, setPositionTicks] = useState<PositionTicksMap>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPositionTicks = useCallback(
    async (positionId: string, poolData: any, lowerTickIndex: number, upperTickIndex: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const wallet = getEclipseWallet()

        const marketProgram = await getMarketProgram(networkType, rpcAddress, wallet as IWallet)

        const pair = new Pair(poolData.tokenX, poolData.tokenY, {
          fee: poolData.fee,
          tickSpacing: poolData.tickSpacing
        })

        const [lowerTick, upperTick] = await Promise.all([
          marketProgram.getTick(pair, lowerTickIndex),
          marketProgram.getTick(pair, upperTickIndex)
        ])

        setPositionTicks(prev => ({
          ...prev,
          [positionId]: {
            lower: lowerTick,
            upper: upperTick,
            lowerIndex: lowerTickIndex,
            upperIndex: upperTickIndex,
            poolAddress: poolData.address
          }
        }))
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching position ticks:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [networkType, rpcAddress]
  )

  const calculateFeesForPosition = useCallback(
    (positionId: string, position: any): [number, number] | null => {
      const tickData = positionTicks[positionId]
      if (!tickData || !position?.poolData) return null

      const [bnX, bnY] = calculateClaimAmount({
        position,
        tickLower: tickData.lower,
        tickUpper: tickData.upper,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      return [+printBN(bnX, position.tokenX.decimals), +printBN(bnY, position.tokenY.decimals)]
    },
    [positionTicks]
  )

  return {
    positionTicks,
    isLoading,
    error,
    fetchPositionTicks,
    calculateFeesForPosition
  }
}
