import { calculatePercentageRatio } from '@components/PositionsList/PositionItem/utils/calculations'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { printBN } from '@utils/utils'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useLiquidity } from '../userOverview/useLiquidity'
import { usePositionTicks } from '../userOverview/usePositionTicks'
import { usePrices } from '../userOverview/usePrices'
import { IPositionItem } from '@components/PositionsList/types'
import { network as currentNetwork, rpcAddress } from '@store/selectors/solanaConnection'
import { getEclipseWallet } from '@utils/web3/wallet'
import { useSelector } from 'react-redux'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'

const UPDATE_INTERVAL = 60000

interface PositionTicks {
  lowerTick: Tick | undefined
  upperTick: Tick | undefined
  loading: boolean
}

interface UnclaimedFeeHook extends IPositionItem {
  positionSingleData: any
  xToY: boolean
}

export const useUnclaimedFee = ({
  currentPrice,
  id,
  position,
  tokenXLiq,
  tokenYLiq,
  positionSingleData,
  xToY
}: Pick<
  UnclaimedFeeHook,
  'currentPrice' | 'id' | 'position' | 'tokenXLiq' | 'tokenYLiq' | 'positionSingleData' | 'xToY'
>) => {
  const wallet = getEclipseWallet()
  const networkType = useSelector(currentNetwork)
  const rpc = useSelector(rpcAddress)

  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const [shouldUpdate, setShouldUpdate] = useState(true)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [previousUnclaimedFees, setPreviousUnclaimedFees] = useState<number>(0)
  const [previousTokenValueInUsd, setPreviousTokenValueInUsd] = useState<number>(0)

  const { tokenXPercentage, tokenYPercentage } = calculatePercentageRatio(
    tokenXLiq,
    tokenYLiq,
    currentPrice,
    xToY
  )

  const { tokenXLiquidity, tokenYLiquidity } = useLiquidity(positionSingleData)
  const { tokenXPriceData, tokenYPriceData } = usePrices({
    tokenX: {
      assetsAddress: positionSingleData?.tokenX.assetAddress.toString(),
      name: positionSingleData?.tokenX.name
    },
    tokenY: {
      assetsAddress: positionSingleData?.tokenY.assetAddress.toString(),
      name: positionSingleData?.tokenY.name
    }
  })

  const {
    lowerTick,
    upperTick,
    loading: ticksLoading
  } = usePositionTicks({
    positionId: id,
    poolData: positionSingleData?.poolData,
    lowerTickIndex: positionSingleData?.lowerTickIndex ?? 0,
    upperTickIndex: positionSingleData?.upperTickIndex ?? 0,
    networkType,
    rpc,
    wallet: wallet as IWallet,
    shouldUpdate
  })

  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })

  useEffect(() => {
    const currentTime = Date.now()

    if (currentTime - lastUpdateRef.current >= UPDATE_INTERVAL || isInitialLoad) {
      setShouldUpdate(true)
      lastUpdateRef.current = currentTime
    }

    updateTimerRef.current = setInterval(() => {
      setShouldUpdate(true)
      lastUpdateRef.current = Date.now()
    }, UPDATE_INTERVAL)

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current)
      }
    }
  }, [isInitialLoad])

  // Update position ticks when new data arrives
  useEffect(() => {
    setPositionTicks({
      lowerTick,
      upperTick,
      loading: ticksLoading
    })

    if (!ticksLoading) {
      setShouldUpdate(false)
    }
  }, [lowerTick, upperTick, ticksLoading])

  const calculateUnclaimedFees = useCallback(() => {
    if (
      !positionSingleData?.poolData ||
      typeof positionTicks.lowerTick === 'undefined' ||
      typeof positionTicks.upperTick === 'undefined'
    ) {
      return null
    }

    const [bnX, bnY] = calculateClaimAmount({
      position,
      tickLower: positionTicks.lowerTick!,
      tickUpper: positionTicks.upperTick!,
      tickCurrent: positionSingleData.poolData.currentTickIndex,
      feeGrowthGlobalX: positionSingleData.poolData.feeGrowthGlobalX,
      feeGrowthGlobalY: positionSingleData.poolData.feeGrowthGlobalY
    })

    const xAmount = +printBN(bnX, positionSingleData.tokenX.decimals)
    const yAmount = +printBN(bnY, positionSingleData.tokenY.decimals)

    return { xAmount, yAmount }
  }, [position, positionTicks, positionSingleData])

  const unclaimedFeesInUSD = useMemo(() => {
    const loading =
      positionTicks.loading ||
      !positionSingleData?.poolData ||
      tokenXPriceData.loading ||
      tokenYPriceData.loading ||
      typeof positionTicks.lowerTick === 'undefined' ||
      typeof positionTicks.upperTick === 'undefined'

    if (loading && !isInitialLoad && previousUnclaimedFees > 0) {
      return { loading: false, value: previousUnclaimedFees }
    }

    if (loading) {
      return { loading: true, value: previousUnclaimedFees }
    }

    const fees = calculateUnclaimedFees()
    if (!fees) {
      return { loading: true, value: previousUnclaimedFees }
    }

    const xValueInUSD = fees.xAmount * tokenXPriceData.price
    const yValueInUSD = fees.yAmount * tokenYPriceData.price
    const totalValueInUSD = xValueInUSD + yValueInUSD

    if (totalValueInUSD.toFixed(6) !== previousUnclaimedFees.toFixed(6) || isInitialLoad) {
      setPreviousUnclaimedFees(totalValueInUSD)
      setIsInitialLoad(false)
    }

    return { loading: false, value: totalValueInUSD }
  }, [
    positionSingleData,
    position,
    positionTicks,
    tokenXPriceData,
    tokenYPriceData,
    previousUnclaimedFees,
    isInitialLoad,
    calculateUnclaimedFees
  ])

  const tokenValueInUsd = useMemo(() => {
    const loading = tokenXPriceData.loading || tokenYPriceData.loading

    if (loading && !isInitialLoad && previousTokenValueInUsd > 0) {
      return { loading: false, value: previousTokenValueInUsd }
    }

    if (loading) {
      return { loading: true, value: previousTokenValueInUsd }
    }

    if (!tokenXLiquidity && !tokenYLiquidity) {
      return { loading: false, value: 0 }
    }

    const xValue = tokenXLiquidity * tokenXPriceData.price
    const yValue = tokenYLiquidity * tokenYPriceData.price
    const totalValue = xValue + yValue

    if (totalValue.toFixed(6) !== previousTokenValueInUsd.toFixed(6) || isInitialLoad) {
      setPreviousTokenValueInUsd(totalValue)
      setIsInitialLoad(false)
    }

    return { loading: false, value: totalValue }
  }, [
    tokenXLiquidity,
    tokenYLiquidity,
    tokenXPriceData,
    tokenYPriceData,
    previousTokenValueInUsd,
    isInitialLoad
  ])

  return { tokenValueInUsd, unclaimedFeesInUSD, tokenXPercentage, tokenYPercentage }
}
