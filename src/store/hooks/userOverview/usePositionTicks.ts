import { useCallback, useEffect, useState } from 'react'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'
import { NetworkType } from '@store/consts/static'

interface PositionTicks {
  lowerTick: Tick | undefined
  upperTick: Tick | undefined
  loading: boolean
  error?: string
}

interface UsePositionTicksProps {
  positionId: string | undefined
  poolData: PoolWithAddressAndIndex | undefined
  lowerTickIndex: number
  upperTickIndex: number
  networkType: NetworkType
  rpc: string
  wallet: IWallet | null
}

export const usePositionTicks = ({
  positionId,
  poolData,
  lowerTickIndex,
  upperTickIndex,
  networkType,
  rpc,
  wallet
}: UsePositionTicksProps): PositionTicks => {
  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })

  const fetchTicksForPosition = useCallback(async () => {
    if (!positionId || !poolData || !wallet) {
      setPositionTicks(prev => ({ ...prev, loading: false }))
      return
    }

    setPositionTicks(prev => ({ ...prev, loading: true, error: undefined }))

    try {
      const marketProgram = await getMarketProgram(networkType, rpc, wallet)
      const pair = new Pair(poolData.tokenX, poolData.tokenY, {
        fee: poolData.fee,
        tickSpacing: poolData.tickSpacing
      })

      const [lowerTick, upperTick] = await Promise.all([
        marketProgram.getTick(pair, lowerTickIndex),
        marketProgram.getTick(pair, upperTickIndex)
      ])

      setPositionTicks({
        lowerTick,
        upperTick,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching ticks:', error)
      setPositionTicks({
        lowerTick: undefined,
        upperTick: undefined,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [positionId, poolData, networkType, rpc, wallet, lowerTickIndex, upperTickIndex])

  useEffect(() => {
    let mounted = true

    const fetch = async () => {
      if (!mounted) return
      await fetchTicksForPosition()
    }

    fetch()

    return () => {
      mounted = false
    }
  }, [fetchTicksForPosition])

  return positionTicks
}
