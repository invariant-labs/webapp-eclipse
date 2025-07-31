import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'
import PositionDetails from '@components/PositionDetails/PositionDetails'
import { Grid, useMediaQuery } from '@mui/material'
import loader from '@static/gif/loader.gif'
import {
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  calcYPerXPriceBySqrtPrice,
  createPlaceholderLiquidityPlot,
  getTokenPrice,
  getMockedTokenPrice,
  printBN,
  ROUTES,
  simulateAutoSwapOnTheSamePool,
  simulateAutoSwap
} from '@utils/utils'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/positions'
import { actions as lockerActions } from '@store/reducers/locker'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { network, timeoutError } from '@store/selectors/solanaConnection'
import {
  changeLiquidity,
  isLoadingPositionsList,
  lockedPositionsNavigationData,
  plotTicks,
  positionData,
  positionsNavigationData,
  positionWithPoolData,
  shouldDisable,
  singlePositionData,
  showFeesLoader as storeFeesLoader
} from '@store/selectors/positions'
import { balance, balanceLoading, poolTokens, status } from '@store/selectors/solanaWallet'
import { VariantType } from 'notistack'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import {
  calculateClaimAmount,
  feeToTickSpacing,
  SimulateSwapAndCreatePositionSimulation,
  SwapAndCreateSimulationStatus,
  toDecimal
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { lockerState } from '@store/selectors/locker'
import { theme } from '@static/theme'
import { actions as statsActions } from '@store/reducers/stats'
import { isLoading, lastInterval, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { getPromotedPools, isLoading as promotedLoading } from '@store/selectors/leaderboard'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { BN } from '@coral-xyz/anchor'
import {
  ALL_FEE_TIERS_DATA,
  autoSwapPools,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP,
  DEFAULT_AUTOSWAP_MIN_UTILIZATION,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  Intervals,
  LEADERBOARD_DECIMAL
} from '@store/consts/static'
import poolsSelectors, {
  autoSwapTicksAndTickMap,
  poolsArraySortedByFees
} from '@store/selectors/pools'
import { estimatePointsForUserPositions } from '@invariant-labs/points-sdk'
import { address } from '@store/selectors/navigation'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions as positionsActions } from '@store/reducers/positions'
import { blurContent, unblurContent } from '@utils/uiUtils'

export interface IProps {
  id: string
}

export type PoolDetails = {
  tvl: number
  volume24: number
  fee24: number
  apy: number
  fee: number
}

export const SinglePositionWrapper: React.FC<IProps> = ({ id }) => {
  const { classes } = useStyles()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const locationHistory = useSelector(address)
  const isFeesLoading = useSelector(storeFeesLoader)
  const currentNetwork = useSelector(network)
  const singlePosition = useSelector(singlePositionData(id))
  const positionPreview = useSelector(positionWithPoolData)
  const position = singlePosition ?? positionPreview ?? undefined
  const isPreview = !singlePosition
  const { loading: positionPreviewLoading } = useSelector(positionData)
  const { success, inProgress } = useSelector(lockerState)
  const poolsList = useSelector(poolsArraySortedByFees)
  const statsPolsList = useSelector(poolsStatsWithTokensDetails)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const disableButton = useSelector(shouldDisable)
  const {
    allData: ticksData,
    loading: ticksLoading,
    hasError: hasTicksError
  } = useSelector(plotTicks)
  useEffect(() => {
    setShowFeesLoader(isFeesLoading)
  }, [isFeesLoading])

  const walletStatus = useSelector(status)
  const ethBalance = useSelector(balance)

  const navigationData = useSelector(positionsNavigationData)
  const lockedNavigationData = useSelector(lockedPositionsNavigationData)
  const poolStatsInterval = useSelector(lastInterval)
  const isTimeoutError = useSelector(timeoutError)

  const [showFeesLoader, setShowFeesLoader] = useState(true)

  const [isFinishedDelayRender, setIsFinishedDelayRender] = useState(false)
  const [isLoadingListDelay, setIsLoadListDelay] = useState(isLoadingList)

  const [isClosingPosition, setIsClosingPosition] = useState(false)

  const isLoadingStats = useSelector(isLoading)

  const previousPosition = useMemo(() => {
    const data = position?.isLocked ? lockedNavigationData : navigationData

    if (data.length < 2) {
      return null
    }

    const currentIndex = data.findIndex(position => position.id.toString() === id)

    if (currentIndex === -1) {
      return null
    }

    return data[currentIndex - 1] ?? null
  }, [position?.isLocked, lockedNavigationData, navigationData, id])

  const nextPosition = useMemo(() => {
    const data = position?.isLocked ? lockedNavigationData : navigationData

    if (data.length < 2) {
      return null
    }

    const currentIndex = data.findIndex(position => position.id.toString() === id)

    if (currentIndex === -1) {
      return null
    }

    return data[currentIndex + 1] ?? null
  }, [position?.isLocked, lockedNavigationData, navigationData, id])

  const lastPosition = useMemo(() => {
    const data = position?.isLocked ? lockedNavigationData : navigationData

    if (data.length < 2) {
      return null
    }

    return data[data.length - 1]
  }, [position?.isLocked, lockedNavigationData, navigationData, id])

  const paginationData = useMemo(() => {
    const data = position?.isLocked ? lockedNavigationData : navigationData

    const currentIndex = data.findIndex(position => position.id.toString() === id)
    return {
      totalPages: data.length,
      currentPage: currentIndex + 1
    }
  }, [position?.isLocked, lockedNavigationData, navigationData])

  const handleChangePagination = (currentIndex: number) => {
    const data = position?.isLocked ? lockedNavigationData : navigationData
    const targetIdx = currentIndex - 1
    if (targetIdx < 0 || targetIdx >= data.length) return

    const navigateToData = data[targetIdx]
    navigate(ROUTES.getPositionRoute(navigateToData.id))
  }

  useEffect(() => {
    if (position?.id) {
      dispatch(actions.setCurrentPositionId(id))

      if (position) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex: position.poolData.poolIndex,
            isXtoY: true
          })
        )

        dispatch(
          actions.getSinglePosition({ index: position.positionIndex, isLocked: position.isLocked })
        )
      }
    }
  }, [position?.id.toString()])

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const midPrice = useMemo(() => {
    if (position?.poolData) {
      return {
        index: position.poolData.currentTickIndex,
        x: calcPriceBySqrtPrice(
          position.poolData.sqrtPrice,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id.toString(), position?.poolData?.sqrtPrice])

  const leftRange = useMemo(() => {
    if (position) {
      return {
        index: position.lowerTickIndex,
        x: calcPriceByTickIndex(
          position.lowerTickIndex,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id])

  const rightRange = useMemo(() => {
    if (position) {
      return {
        index: position.upperTickIndex,
        x: calcPriceByTickIndex(
          position.upperTickIndex,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id])

  const min = useMemo(
    () =>
      position
        ? calcYPerXPriceBySqrtPrice(
            calculatePriceSqrt(position.lowerTickIndex),
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position?.lowerTickIndex, position?.id.toString()]
  )
  const max = useMemo(
    () =>
      position
        ? calcYPerXPriceBySqrtPrice(
            calculatePriceSqrt(position.upperTickIndex),
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position?.upperTickIndex, position?.id.toString()]
  )
  const current = useMemo(
    () =>
      position?.poolData
        ? calcPriceBySqrtPrice(
            position.poolData.sqrtPrice,
            true,
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position, position?.id.toString()]
  )

  const tokenXLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getX(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenX.decimals
        )
      } catch {
        return 0
      }
    }

    return 0
  }, [position])

  const tokenYLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getY(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenY.decimals
        )
      } catch {
        return 0
      }
    }

    return 0
  }, [position])

  const [tokenXClaim, tokenYClaim] = useMemo(() => {
    if (
      position?.ticksLoading === false &&
      position?.poolData &&
      typeof position?.lowerTick !== 'undefined' &&
      typeof position?.upperTick !== 'undefined'
    ) {
      const [bnX, bnY] = calculateClaimAmount({
        position,
        tickLower: position.lowerTick,
        tickUpper: position.upperTick,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      setShowFeesLoader(false)

      return [+printBN(bnX, position.tokenX.decimals), +printBN(bnY, position.tokenY.decimals)]
    }

    return [0, 0]
  }, [position])

  const data = useMemo(() => {
    if (ticksLoading && position) {
      return createPlaceholderLiquidityPlot(
        true,
        10,
        position.poolData.tickSpacing,
        position.tokenX.decimals,
        position.tokenY.decimals
      )
    }

    return ticksData
  }, [ticksData, ticksLoading, position?.id.toString()])

  const [triggerFetchPrice, setTriggerFetchPrice] = useState(false)

  const [tokenXPriceData, setTokenXPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [pricesLoading, setPricesLoading] = useState(false)

  const [tokenYPriceData, setTokenYPriceData] = useState<TokenPriceData | undefined>(undefined)

  useEffect(() => {
    if (!position) {
      return
    }
    setPricesLoading(true)
    const xAddr = position.tokenX.assetAddress.toString()
    getTokenPrice(xAddr, currentNetwork)
      .then(data => setTokenXPriceData({ price: data ?? 0 }))
      .catch(() => setTokenXPriceData(getMockedTokenPrice(position.tokenX.symbol, currentNetwork)))
      .finally(() => {
        setPricesLoading(false)
      })

    const yAddr = position.tokenY.assetAddress.toString()
    getTokenPrice(yAddr, currentNetwork)
      .then(data => setTokenYPriceData({ price: data ?? 0 }))
      .catch(() => setTokenYPriceData(getMockedTokenPrice(position.tokenY.symbol, currentNetwork)))
      .finally(() => {
        setPricesLoading(false)
      })
  }, [position?.id, triggerFetchPrice])

  const copyPoolAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  useEffect(() => {
    if (isFinishedDelayRender) {
      return
    }
    if (walletStatus === Status.Initialized) {
      setIsFinishedDelayRender(true)
    }
    const timer = setTimeout(() => {
      setIsFinishedDelayRender(true)
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [walletStatus])

  useEffect(() => {
    if (!isLoadingList) {
      setTimeout(() => {
        setIsLoadListDelay(false)
      }, 300)

      return () => {
        setIsLoadListDelay(true)
      }
    }
  }, [isLoadingList])

  const onRefresh = () => {
    if (position?.positionIndex === undefined) {
      return
    }
    setTriggerFetchPrice(!triggerFetchPrice)
    setShowFeesLoader(true)

    if (isPreview) {
      dispatch(actions.getPreviewPosition(id))
    } else {
      dispatch(
        actions.getSinglePosition({ index: position.positionIndex, isLocked: position.isLocked })
      )
    }

    if (position) {
      dispatch(
        actions.getCurrentPlotTicks({
          poolIndex: position.poolData.poolIndex,
          isXtoY: true
          // fetchTicksAndTickmap: true
        })
      )

      dispatch(walletActions.getBalance())
    }
  }

  useEffect(() => {
    if (isTimeoutError) {
      dispatch(actions.getPositionsList())
    }
  }, [isTimeoutError])

  useEffect(() => {
    dispatch(actions.getPreviewPosition(id))
  }, [poolsList.length])

  useEffect(() => {
    if (!isLoadingList && isTimeoutError) {
      if (position?.positionIndex === undefined && isClosingPosition) {
        setIsClosingPosition(false)
        dispatch(connectionActions.setTimeoutError(false))

        if (nextPosition) {
          navigate(ROUTES.getPositionRoute(nextPosition.id))
        } else if (previousPosition) {
          navigate(ROUTES.getPositionRoute(previousPosition.id))
        } else {
          navigate(ROUTES.PORTFOLIO)
        }
      } else {
        dispatch(connectionActions.setTimeoutError(false))
        onRefresh()
      }
    }
  }, [isLoadingList])

  useEffect(() => {
    dispatch(statsActions.getCurrentIntervalStats({ interval: Intervals.Daily }))
  }, [])

  const poolDetails = useMemo(() => {
    if (!position) {
      return null
    }

    const pool = statsPolsList.find(pool => pool.poolAddress.equals(position?.poolData.address))

    if (!pool) {
      return null
    }

    return {
      tvl: pool.tvl,
      volume24: pool.volume24,
      fee24: (pool.volume24 * pool.fee) / 100,
      apy: pool.apy,
      fee: pool.fee
    }
  }, [poolsList, position])

  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  const promotedPools = useSelector(getPromotedPools)
  const isPromotedLoading = useSelector(promotedLoading)
  const isPromoted = promotedPools.some(
    pool => pool.address === position?.poolData.address.toString()
  )

  const calculatePoints24 = () => {
    if (!position) {
      return 0
    }

    const pointsPerSecond = promotedPools.find(
      pool => pool.address === position?.poolData.address.toString()
    )?.pointsPerSecond

    try {
      return estimatePointsForUserPositions(
        [position],
        position.poolData,
        new BN(pointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
      )
    } catch {
      return 0
    }
  }
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  const points24 = calculatePoints24()
  const handleBack = (isConnected: boolean) => {
    const path = locationHistory === ROUTES.ROOT ? ROUTES.PORTFOLIO : locationHistory
    const isNavigatingFromNewPosition = path === location.pathname
    navigate(
      isConnected ? (isNavigatingFromNewPosition ? ROUTES.PORTFOLIO : path) : ROUTES.LIQUIDITY
    )
  }

  const tokens = useSelector(poolTokens)
  const isBalanceLoading = useSelector(balanceLoading)

  const onConnectWallet = () => {
    dispatch(walletActions.connect(false))
  }

  const onDisconnectWallet = () => {
    dispatch(walletActions.disconnect())
  }

  const getPoolData = (pair: Pair) => {
    dispatch(poolsActions.getPoolData(pair))
  }

  const setShouldNotUpdateRange = () => {
    dispatch(positionsActions.setShouldNotUpdateRange(true))
  }

  const autoSwapPoolData = useSelector(poolsSelectors.autoSwapPool)
  const { ticks: autoSwapTicks, tickmap: autoSwapTickMap } = useSelector(autoSwapTicksAndTickMap)
  const isLoadingAutoSwapPool = useSelector(poolsSelectors.isLoadingAutoSwapPool)
  const isLoadingAutoSwapPoolTicksOrTickMap = useSelector(
    poolsSelectors.isLoadingAutoSwapPoolTicksOrTickMap
  )
  const { success: changeLiquiditySuccess, inProgress: changeLiquidityInProgress } =
    useSelector(changeLiquidity)

  const setChangeLiquiditySuccess = (value: boolean) => {
    dispatch(positionsActions.setChangeLiquiditySuccess(value))
  }

  const [isChangeLiquidityModalShown, setIsChangeLiquidityModalShown] = useState(false)
  const [isAddLiquidity, setIsAddLiquidity] = useState(true)

  useEffect(() => {
    if (isChangeLiquidityModalShown) {
      blurContent()
    } else {
      unblurContent()
    }
  }, [isChangeLiquidityModalShown])

  const [throttle, setThrottle] = useState<boolean>(false)

  const [simulation, setSimulation] = useState<SimulateSwapAndCreatePositionSimulation | null>(null)
  const [simulationParams, setSimulationParams] = useState<{
    xAmount: BN
    yAmount: BN
    swapSlippage: BN
    minUtilizationPercentage: BN
    positionSlippage: BN
  } | null>(null)

  const isAutoswapAvailable = useMemo(
    () =>
      !!position &&
      autoSwapPools.some(
        item =>
          (item.pair.tokenX.equals(position.tokenX.assetAddress) &&
            item.pair.tokenY.equals(position.tokenY.assetAddress)) ||
          (item.pair.tokenX.equals(position.tokenY.assetAddress) &&
            item.pair.tokenY.equals(position.tokenX.assetAddress))
      ),
    [position]
  )

  const isAutoSwapOnTheSamePool = useMemo(
    () =>
      !!position &&
      autoSwapPools.some(item => item.swapPool.address.equals(position.poolData.address)),
    [position]
  )

  const autoSwapPool = useMemo(
    () =>
      !!position
        ? autoSwapPools.find(
            item =>
              (item.pair.tokenX.equals(position.tokenX.assetAddress) &&
                item.pair.tokenY.equals(position.tokenY.assetAddress)) ||
              (item.pair.tokenX.equals(position.tokenY.assetAddress) &&
                item.pair.tokenY.equals(position.tokenX.assetAddress))
          )
        : undefined,
    [position]
  )

  const isSimulationStatus = useCallback(
    (value: SwapAndCreateSimulationStatus) => {
      return !!simulation && simulation.status === value
    },
    [simulation]
  )

  useEffect(() => {
    if (!position || !autoSwapPool) return
    dispatch(
      poolsActions.getAutoSwapPoolData(
        new Pair(position.tokenX.assetAddress, position.tokenY.assetAddress, {
          fee: ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee,
          tickSpacing:
            ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.tickSpacing ??
            feeToTickSpacing(ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee)
        })
      )
    )
  }, [autoSwapPool])

  useEffect(() => {
    if (autoSwapPoolData && !!position) {
      dispatch(
        poolsActions.getTicksAndTickMapForAutoSwap({
          tokenFrom: position.tokenX.assetAddress,
          tokenTo: position.tokenY.assetAddress,
          autoSwapPool: autoSwapPoolData
        })
      )
    }
  }, [autoSwapPoolData])

  const simulateAutoSwapResult = async () => {
    if (
      ticksLoading ||
      !position ||
      typeof position?.lowerTick === 'undefined' ||
      typeof position?.upperTick === 'undefined' ||
      !autoSwapPoolData ||
      !autoSwapTicks ||
      !autoSwapTickMap ||
      !position.poolData ||
      !isAutoswapAvailable
    ) {
      setSimulation(null)
      setSimulationParams(null)
      return
    }

    const [amountX, amountY] = calculateClaimAmount({
      position,
      tickLower: position.lowerTick,
      tickUpper: position.upperTick,
      tickCurrent: position.poolData.currentTickIndex,
      feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
      feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
    })

    if (amountX.eqn(0) && amountY.eqn(0)) {
      setSimulation(null)
      setSimulationParams(null)
      return
    }

    const slippageToleranceSwap =
      localStorage.getItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP') ??
      DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP
    const slippageToleranceAddLiquidity =
      localStorage.getItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY') ??
      DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY
    const utilization =
      localStorage.getItem('INVARIANT_AUTOSWAP_MIN_UTILIZATION') ?? DEFAULT_AUTOSWAP_MIN_UTILIZATION

    const swapSlippage = toDecimal(+Number(slippageToleranceSwap).toFixed(4), 2)
    const positionSlippage = toDecimal(+Number(slippageToleranceAddLiquidity).toFixed(4), 2)
    const minUtilizationPercentage = toDecimal(+Number(utilization).toFixed(4), 2)

    let result: SimulateSwapAndCreatePositionSimulation | null = null

    if (isAutoSwapOnTheSamePool) {
      result = await simulateAutoSwapOnTheSamePool(
        amountX,
        amountY,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickMap,
        swapSlippage,
        position.lowerTickIndex,
        position.upperTickIndex,
        minUtilizationPercentage
      )
    } else {
      result = await simulateAutoSwap(
        amountX,
        amountY,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickMap,
        swapSlippage,
        positionSlippage,
        position.lowerTickIndex,
        position.upperTickIndex,
        position.poolData.sqrtPrice,
        minUtilizationPercentage
      )
    }
    setSimulationParams({
      xAmount: amountX,
      yAmount: amountY,
      swapSlippage,
      minUtilizationPercentage,
      positionSlippage
    })
    setSimulation(result)
  }

  const timeoutRef = useRef<number>(0)

  const simulateWithTimeout = () => {
    setThrottle(true)

    clearTimeout(timeoutRef.current)
    const timeout = setTimeout(() => {
      simulateAutoSwapResult().finally(() => {
        setThrottle(false)
      })
    }, 500)
    timeoutRef.current = timeout as unknown as number
  }

  useEffect(() => {
    simulateWithTimeout()
  }, [
    position,
    autoSwapPoolData,
    autoSwapTicks,
    autoSwapTickMap,
    ticksLoading,
    isAutoswapAvailable,
    isAutoSwapOnTheSamePool
  ])

  if (position) {
    return (
      <PositionDetails
        isCompundDisabled={
          throttle || !simulation || !simulationParams || !position || position.isLocked
        }
        shouldDisable={disableButton}
        tokenXAddress={position.tokenX.assetAddress}
        tokenYAddress={position.tokenY.assetAddress}
        poolAddress={position.poolData.address}
        interval={poolStatsInterval || Intervals.Daily}
        copyPoolAddressHandler={copyPoolAddressHandler}
        detailsData={data}
        midPrice={midPrice}
        leftRange={leftRange}
        rightRange={rightRange}
        currentPrice={current}
        onClickCompound={() => {
          if (
            isPreview ||
            throttle ||
            !simulation ||
            !autoSwapPoolData ||
            !autoSwapTickMap ||
            !simulationParams
          )
            return

          const positionPoolIndex = poolsList.findIndex(
            pool =>
              pool.fee.eq(position.poolData.fee) &&
              ((pool.tokenX.equals(position.tokenX.assetAddress) &&
                pool.tokenY.equals(position.tokenY.assetAddress)) ||
                (pool.tokenX.equals(position.tokenY.assetAddress) &&
                  pool.tokenY.equals(position.tokenX.assetAddress)))
          )
          if (positionPoolIndex === -1) return

          const { xAmount, yAmount, swapSlippage, positionSlippage, minUtilizationPercentage } =
            simulationParams

          if (isSimulationStatus(SwapAndCreateSimulationStatus.PerfectRatio)) {
            const positionSlippage =
              localStorage.getItem('INVARIANT_NEW_POSITION_SLIPPAGE') ??
              DEFAULT_NEW_POSITION_SLIPPAGE
            const slippage = toDecimal(+Number(positionSlippage).toFixed(4), 2)

            dispatch(
              actions.compound({
                tokenX: position.tokenX.assetAddress,
                tokenY: position.tokenY.assetAddress,
                xAmount,
                yAmount,
                positionIndex: position.positionIndex,
                slippage,
                liquidity: simulation.position.liquidity
              })
            )
            return
          }
          if (!simulation.swapInput || !simulation.swapSimulation) return

          const { xToY, swapAmount, byAmountIn } = simulation.swapInput

          const { crossedTicks, priceAfterSwap: estimatedPriceAfterSwap } =
            simulation.swapSimulation

          dispatch(
            actions.compoundWithSwap({
              xAmount,
              yAmount,
              tokenX: position.tokenX.assetAddress,
              tokenY: position.tokenY.assetAddress,
              swapAmount,
              byAmountIn,
              xToY,
              swapPool: autoSwapPoolData,
              swapPoolTickmap: autoSwapTickMap,
              swapSlippage,
              estimatedPriceAfterSwap,
              crossedTicks,
              positionPair: {
                fee: position.poolData.fee,
                tickSpacing: position.poolData.tickSpacing
              },
              positionPoolIndex,
              positionPoolPrice: position.poolData.sqrtPrice,
              positionSlippage,
              liquidityDelta: simulation.position.liquidity,
              minUtilizationPercentage,
              isSamePool: position.poolData.address.equals(autoSwapPoolData.address),
              positionIndex: position.positionIndex
            })
          )
        }}
        onClickClaimFee={() => {
          if (isPreview) return

          setShowFeesLoader(true)
          dispatch(actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked }))
        }}
        lockPosition={() => {
          if (isPreview) return
          dispatch(
            lockerActions.lockPosition({ index: position.positionIndex, network: currentNetwork })
          )
        }}
        closePosition={claimFarmRewards => {
          if (isPreview) return
          setIsClosingPosition(true)
          dispatch(
            actions.closePosition({
              positionIndex: position.positionIndex,
              onSuccess: () => {
                if (lastPosition && nextPosition) {
                  navigate(ROUTES.getPositionRoute(lastPosition.id), { replace: true })
                } else if (previousPosition) {
                  navigate(ROUTES.getPositionRoute(previousPosition.id), { replace: true })
                } else {
                  navigate(ROUTES.PORTFOLIO)
                }
              },
              claimFarmRewards
            })
          )
        }}
        changeLiquidity={(
          liquidity,
          slippage,
          isAddLiquidity,
          isClosePosition,
          xAmount,
          yAmount
        ) => {
          if (isPreview) return
          if (isAddLiquidity) {
            dispatch(
              actions.addLiquidity({
                positionIndex: position.positionIndex,
                liquidity,
                slippage,
                isClosePosition,
                xAmount,
                yAmount
              })
            )
          } else {
            dispatch(
              actions.removeLiquidity({
                positionIndex: position.positionIndex,
                liquidity,
                slippage,
                isClosePosition,
                xAmount,
                yAmount,
                onSuccess: () => {
                  if (lastPosition && nextPosition) {
                    navigate(ROUTES.getPositionRoute(lastPosition.id), { replace: true })
                  } else if (previousPosition) {
                    navigate(ROUTES.getPositionRoute(previousPosition.id), { replace: true })
                  } else {
                    navigate(ROUTES.PORTFOLIO)
                  }

                  setIsChangeLiquidityModalShown(false)
                }
              })
            )
          }
        }}
        swapAndAddLiquidity={(
          xAmount,
          yAmount,
          swapAmount,
          xToY,
          byAmountIn,
          estimatedPriceAfterSwap,
          crossedTicks,
          swapSlippage,
          positionSlippage,
          minUtilizationPercentage,
          poolIndex,
          liquidity
        ) => {
          if (!autoSwapPoolData || !autoSwapTickMap) {
            return
          }

          dispatch(
            actions.swapAndAddLiquidity({
              xAmount,
              yAmount,
              tokenX: (xToY ? position.tokenX : position.tokenY).assetAddress,
              tokenY: (xToY ? position.tokenY : position.tokenX).assetAddress,
              swapAmount,
              byAmountIn,
              xToY,
              swapPool: autoSwapPoolData,
              swapPoolTickmap: autoSwapTickMap,
              swapSlippage,
              estimatedPriceAfterSwap,
              crossedTicks,
              positionPair: {
                fee: position.poolData.fee,
                tickSpacing: position.poolData.tickSpacing
              },
              positionPoolIndex: poolIndex,
              positionPoolPrice: position.poolData.sqrtPrice,
              positionSlippage,
              lowerTick: position.lowerTickIndex,
              upperTick: position.upperTickIndex,
              liquidityDelta: liquidity,
              minUtilizationPercentage,
              isSamePool: position.poolData.address.equals(autoSwapPoolData.address),
              positionIndex: position.positionIndex
            })
          )
        }}
        ticksLoading={ticksLoading || !position}
        tickSpacing={position?.poolData.tickSpacing ?? 1}
        tokenX={{
          name: position.tokenX.symbol,
          icon: position.tokenX.logoURI,
          decimal: position.tokenX.decimals,
          balance: +printBN(position.tokenX.balance, position.tokenX.decimals),
          liqValue: tokenXLiquidity,
          claimValue: tokenXClaim,
          usdValue:
            typeof tokenXPriceData?.price === 'undefined'
              ? undefined
              : tokenXPriceData.price * +printBN(position.tokenX.balance, position.tokenX.decimals)
        }}
        tokenXPriceData={tokenXPriceData}
        tokenY={{
          name: position.tokenY.symbol,
          icon: position.tokenY.logoURI,
          decimal: position.tokenY.decimals,
          balance: +printBN(position.tokenY.balance, position.tokenY.decimals),
          liqValue: tokenYLiquidity,
          claimValue: tokenYClaim,
          usdValue:
            typeof tokenYPriceData?.price === 'undefined'
              ? undefined
              : tokenYPriceData.price * +printBN(position.tokenY.balance, position.tokenY.decimals)
        }}
        tokenYPriceData={tokenYPriceData}
        fee={position.poolData.fee}
        min={min}
        max={max}
        showFeesLoader={showFeesLoader || positionPreviewLoading || position.ticksLoading}
        hasTicksError={hasTicksError}
        reloadHandler={() => {
          dispatch(
            actions.getCurrentPlotTicks({
              poolIndex: position.poolData.poolIndex,
              isXtoY: true
            })
          )
        }}
        onRefresh={onRefresh}
        network={currentNetwork}
        isLocked={position.isLocked}
        success={success}
        inProgress={inProgress}
        ethBalance={ethBalance}
        poolDetails={poolDetails}
        onGoBackClick={() => handleBack(isConnected)}
        showPoolDetailsLoader={isLoadingStats}
        isPromoted={isPromoted}
        points24={points24}
        isPreview={isPreview}
        showPositionLoader={position.ticksLoading}
        isPromotedLoading={isPromotedLoading}
        pricesLoading={pricesLoading}
        previousPosition={previousPosition}
        nextPosition={nextPosition}
        positionId={id}
        paginationData={paginationData}
        handleChangePagination={handleChangePagination}
        tokens={tokens}
        walletStatus={walletStatus}
        allPools={poolsList}
        isBalanceLoading={isBalanceLoading}
        isTimeoutError={isTimeoutError}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
        getPoolData={getPoolData}
        setShouldNotUpdateRange={setShouldNotUpdateRange}
        autoSwapPoolData={autoSwapPoolData}
        autoSwapTicks={autoSwapTicks}
        autoSwapTickMap={autoSwapTickMap}
        isLoadingAutoSwapPool={isLoadingAutoSwapPool}
        isLoadingAutoSwapPoolTicksOrTickMap={isLoadingAutoSwapPoolTicksOrTickMap}
        ticksData={ticksData}
        changeLiquiditySuccess={changeLiquiditySuccess}
        changeLiquidityInProgress={changeLiquidityInProgress}
        setChangeLiquiditySuccess={setChangeLiquiditySuccess}
        positionLiquidity={position.liquidity}
        isChangeLiquidityModalShown={isChangeLiquidityModalShown}
        setIsChangeLiquidityModalShown={setIsChangeLiquidityModalShown}
        isAddLiquidity={isAddLiquidity}
        setIsAddLiquidity={setIsAddLiquidity}
      />
    )
  }
  if (
    (isLoadingListDelay && walletStatus === Status.Initialized) ||
    !isFinishedDelayRender ||
    positionPreviewLoading
  ) {
    return (
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        className={classes.fullHeightContainer}>
        <img src={loader} className={classes.loading} alt='Loading' />
      </Grid>
    )
  } else if (walletStatus !== Status.Initialized) {
    return (
      <Grid className={classes.emptyContainer}>
        <EmptyPlaceholder
          newVersion
          themeDark
          style={isMobile ? { paddingTop: 8 } : {}}
          roundedCorners={true}
          mainTitle='Wallet is not connected'
          desc='No liquidity positions to show'
          withButton={false}
          connectButton={true}
          onAction2={() => dispatch(walletActions.connect(false))}
        />
      </Grid>
    )
  } else {
    return (
      <Grid
        display='flex'
        position='relative'
        justifyContent='center'
        className={classes.emptyContainer}>
        <EmptyPlaceholder
          newVersion
          style={isMobile ? { paddingTop: 5 } : {}}
          themeDark
          roundedCorners
          desc='The position does not exist in your list! '
          onAction={() => navigate(ROUTES.PORTFOLIO)}
          buttonName='Back to positions'
        />
      </Grid>
    )
  }
}
