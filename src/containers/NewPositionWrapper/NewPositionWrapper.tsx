import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import NewPosition from '@components/NewPosition/NewPosition'
import {
  ALL_FEE_TIERS_DATA,
  DEFAULT_AUTOSWAP_MAX_PRICE_IMPACT,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_CREATE_POSITION,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP,
  DEFAULT_AUTOSWAP_MIN_UTILIZATION,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  Intervals,
  LEADERBOARD_DECIMAL,
  autoSwapPools,
  commonTokensForNetworks
} from '@store/consts/static'
import { PositionOpeningMethod, TokenPriceData } from '@store/consts/types'
import {
  addNewTokenToLocalStorage,
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  createPlaceholderLiquidityPlot,
  getMockedTokenPrice,
  getNewTokenOrThrow,
  getTokenPrice,
  printBN,
  ROUTES,
  sciToString,
  tickerToAddress
} from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions, actions as positionsActions } from '@store/reducers/positions'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { network, timeoutError } from '@store/selectors/solanaConnection'
import poolsSelectors, {
  autoSwapTicksAndTickMap,
  isLoadingLatestPoolsForTransaction,
  isLoadingPathTokens,
  isLoadingTokens,
  poolsArraySortedByFees
} from '@store/selectors/pools'
import { initPosition, plotTicks, shouldNotUpdateRange } from '@store/selectors/positions'
import { balanceLoading, status, balance, poolTokens } from '@store/selectors/solanaWallet'
import { VariantType } from 'notistack'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentSolanaConnection, networkTypetoProgramNetwork } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import { DECIMAL, feeToTickSpacing } from '@invariant-labs/sdk-eclipse/lib/utils'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { getMarketAddress, Pair } from '@invariant-labs/sdk-eclipse'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { estimatePointsForLiquidity } from '@invariant-labs/points-sdk'
import { PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as statsActions } from '@store/reducers/stats'
import { isLoading, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { address } from '@store/selectors/navigation'

export interface IProps {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
  initialConcentration: string
  initialIsRange: boolean | null
}

export const NewPositionWrapper: React.FC<IProps> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  initialConcentration,
  initialIsRange
}) => {
  const dispatch = useDispatch()
  const connection = getCurrentSolanaConnection()
  const ethBalance = useSelector(balance)
  const locationHistory = useSelector(address)
  const tokens = useSelector(poolTokens)
  const walletStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const autoSwapPoolData = useSelector(poolsSelectors.autoSwapPool)
  const { ticks: autoSwapTicks, tickmap: autoSwapTickMap } = useSelector(autoSwapTicksAndTickMap)
  const isLoadingAutoSwapPool = useSelector(poolsSelectors.isLoadingAutoSwapPool)
  const isLoadingAutoSwapPoolTicksOrTickMap = useSelector(
    poolsSelectors.isLoadingAutoSwapPoolTicksOrTickMap
  )
  const isBalanceLoading = useSelector(balanceLoading)
  const shouldNotUpdatePriceRange = useSelector(shouldNotUpdateRange)
  const currentNetwork = useSelector(network)
  const { success, inProgress } = useSelector(initPosition)
  const { promotedPools } = useSelector(leaderboardSelectors.config)
  // const [onlyUserPositions, setOnlyUserPositions] = useState(false)
  const {
    allData: ticksData,
    loading: ticksLoading,
    hasError: hasTicksError
  } = useSelector(plotTicks)

  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)

  const isLoadingTicksOrTickmap = useMemo(
    () => ticksLoading || isLoadingAutoSwapPoolTicksOrTickMap || isLoadingAutoSwapPool,
    [ticksLoading, isLoadingAutoSwapPoolTicksOrTickMap, isLoadingAutoSwapPool]
  )
  const [liquidity, setLiquidity] = useState<BN>(new BN(0))

  const [poolIndex, setPoolIndex] = useState<number | null>(null)

  const [progress, setProgress] = useState<ProgressState>('none')

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [currentPairReversed, setCurrentPairReversed] = useState<boolean | null>(null)
  const [initialLoader, setInitialLoader] = useState(true)
  const isMountedRef = useRef(false)
  const navigate = useNavigate()
  const isCurrentlyLoadingTokens = useSelector(isLoadingTokens)
  const isTimeoutError = useSelector(timeoutError)
  const isPathTokensLoading = useSelector(isLoadingPathTokens)
  const { state } = useLocation()
  const [block, setBlock] = useState(state?.referer === 'stats')

  const initialIsConcentrationOpening =
    localStorage.getItem('OPENING_METHOD') === 'concentration' ||
    localStorage.getItem('OPENING_METHOD') === null

  const [initialOpeningPositionMethod, setInitialOpeningPositionMethod] =
    useState<PositionOpeningMethod>(
      initialIsRange !== null
        ? initialIsRange
          ? 'range'
          : 'concentration'
        : initialIsConcentrationOpening
          ? 'concentration'
          : 'range'
    )

  useEffect(() => {
    const pathTokens: string[] = []

    if (
      initialTokenFrom !== '' &&
      tokens.findIndex(
        token =>
          token.address.toString() === (tickerToAddress(currentNetwork, initialTokenFrom) ?? '')
      ) === -1
    ) {
      pathTokens.push(initialTokenFrom)
    }

    if (
      initialTokenTo !== '' &&
      tokens.findIndex(
        token =>
          token.address.toString() === (tickerToAddress(currentNetwork, initialTokenTo) ?? '')
      ) === -1
    ) {
      pathTokens.push(initialTokenTo)
    }

    if (pathTokens.length) {
      dispatch(poolsActions.getPathTokens(pathTokens))
    }

    setBlock(false)
  }, [tokens])

  const canNavigate = connection !== null && !isPathTokensLoading && !block

  const handleBack = () => {
    const path = locationHistory === ROUTES.ROOT ? ROUTES.PORTFOLIO : locationHistory
    navigate(path)
  }

  useEffect(() => {
    if (canNavigate) {
      const tokenAIndex = tokens.findIndex(token => token.address.toString() === initialTokenFrom)
      if (tokenAIndex !== -1) {
        setTokenAIndex(tokenAIndex)
      }

      const tokenBIndex = tokens.findIndex(token => token.address.toString() === initialTokenTo)
      if (tokenBIndex !== -1) {
        setTokenBIndex(tokenBIndex)
      }
    }
  }, [canNavigate])

  const getTokenIndex = (ticker: string) => {
    const address = tickerToAddress(currentNetwork, ticker)
    if (!address) return { address: null, index: -1 }

    const index = tokens.findIndex(token => token.assetAddress.toString() === address)
    return { address, index }
  }

  const constructNavigationPath = () => {
    if (!canNavigate) return null

    const { address: fromAddress, index: fromIndex } = getTokenIndex(initialTokenFrom)
    const { address: toAddress, index: toIndex } = getTokenIndex(initialTokenTo)

    const concentrationParam = initialConcentration ? `?conc=${initialConcentration}` : ''

    const rangeParam =
      initialIsRange !== null
        ? initialIsRange
          ? `&range=true`
          : '&range=false'
        : initialIsConcentrationOpening
          ? '&range=false'
          : '&range=true'

    if (rangeParam === '&range=true') {
      setPositionOpeningMethod('range')
      setInitialOpeningPositionMethod('range')
    } else {
      setPositionOpeningMethod('concentration')
      setInitialOpeningPositionMethod('concentration')
    }

    if (fromAddress && fromIndex !== -1 && toAddress && toIndex !== -1) {
      return ROUTES.getNewPositionRoute(
        initialTokenFrom,
        initialTokenTo,
        initialFee + concentrationParam + rangeParam
      )
    }

    if (fromAddress && fromIndex !== -1) {
      return ROUTES.getNewPositionRoute(initialTokenFrom, initialFee)
    }

    return ROUTES.getNewPositionRoute(initialFee)
  }

  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  clearTimeout(urlUpdateTimeoutRef.current)

  useEffect(() => {
    const path = constructNavigationPath()
    if (path) {
      urlUpdateTimeoutRef.current = setTimeout(() => {
        navigate(path)
      }, 500)
    }
  }, [tokens, canNavigate])

  useEffect(() => {
    isMountedRef.current = true

    dispatch(leaderboardActions.getLeaderboardConfig())
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setProgress('none')
  }, [poolIndex])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex,
            isXtoY: allPools[poolIndex].tokenX.equals(
              tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
            ),
            disableLoading: true
          })
        )
      }

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 500)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
        dispatch(actions.setInitPositionSuccess(false))
      }, 1800)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

  const isXtoY = useMemo(() => {
    if (tokenAIndex !== null && tokenBIndex !== null) {
      return (
        tokens[tokenAIndex].assetAddress.toString() < tokens[tokenBIndex].assetAddress.toString()
      )
    }
    return true
  }, [tokenAIndex, tokenBIndex])

  const xDecimal = useMemo(() => {
    if (tokenAIndex !== null && tokenBIndex !== null) {
      return tokens[tokenAIndex].assetAddress.toString() <
        tokens[tokenBIndex].assetAddress.toString()
        ? tokens[tokenAIndex].decimals
        : tokens[tokenBIndex].decimals
    }
    return 0
  }, [tokenAIndex, tokenBIndex])

  const yDecimal = useMemo(() => {
    if (tokenAIndex !== null && tokenBIndex !== null) {
      return tokens[tokenAIndex].assetAddress.toString() <
        tokens[tokenBIndex].assetAddress.toString()
        ? tokens[tokenBIndex].decimals
        : tokens[tokenAIndex].decimals
    }
    return 0
  }, [tokenAIndex, tokenBIndex])

  const [feeIndex, setFeeIndex] = useState(0)

  const fee = useMemo(() => ALL_FEE_TIERS_DATA[feeIndex].tier.fee, [feeIndex])
  const tickSpacing = useMemo(
    () =>
      ALL_FEE_TIERS_DATA[feeIndex].tier.tickSpacing ??
      feeToTickSpacing(ALL_FEE_TIERS_DATA[feeIndex].tier.fee),
    [feeIndex]
  )
  const [midPrice, setMidPrice] = useState<InitMidPrice>({
    index: 0,
    x: 1,
    sqrtPrice: new BN(0)
  })

  const currentPoolAddress = useMemo(() => {
    if (tokenAIndex === null || tokenBIndex === null) return null
    const net = networkTypetoProgramNetwork(currentNetwork)
    const marketAddress = new PublicKey(getMarketAddress(net))
    try {
      return new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
        fee,
        tickSpacing
      }).getAddress(marketAddress)
    } catch (e) {
      return PublicKey.default
    }
  }, [tokenAIndex, tokenBIndex, fee, tickSpacing, currentNetwork])

  const isWaitingForNewPool = useMemo(() => {
    if (poolIndex !== null) {
      return false
    }

    return isFetchingNewPool
  }, [isFetchingNewPool, poolIndex])

  useEffect(() => {
    if (initialLoader && !isWaitingForNewPool) {
      setInitialLoader(false)
    }
  }, [isWaitingForNewPool])

  useEffect(() => {
    if (
      !isWaitingForNewPool &&
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      tokenAIndex !== tokenBIndex
    ) {
      const index = allPools.findIndex(
        pool =>
          pool.fee.eq(fee) &&
          ((pool.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
            pool.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (pool.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              pool.tokenY.equals(tokens[tokenAIndex].assetAddress)))
      )
      setPoolIndex(index !== -1 ? index : null)

      if (index !== -1) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex: index,
            isXtoY: allPools[index].tokenX.equals(tokens[tokenAIndex].assetAddress)
          })
        )
      }
    }
  }, [isWaitingForNewPool, allPools.length])

  useEffect(() => {
    if (poolIndex !== null && !!allPools[poolIndex]) {
      setMidPrice({
        index: allPools[poolIndex].currentTickIndex,
        x: calcPriceBySqrtPrice(allPools[poolIndex].sqrtPrice, isXtoY, xDecimal, yDecimal),
        sqrtPrice: allPools[poolIndex].sqrtPrice
      })
    }
  }, [poolIndex, isXtoY, xDecimal, yDecimal, allPools])

  useEffect(() => {
    if (poolIndex === null) {
      setMidPrice({
        index: 0,
        x: calcPriceByTickIndex(0, isXtoY, xDecimal, yDecimal),
        sqrtPrice: new BN(0)
      })
    }
  }, [poolIndex, isXtoY, xDecimal, yDecimal])

  const data = useMemo(() => {
    if (ticksLoading) {
      return createPlaceholderLiquidityPlot(isXtoY, 10, tickSpacing, xDecimal, yDecimal)
    }

    if (currentPairReversed === true) {
      return ticksData.map(tick => ({ ...tick, x: 1 / tick.x })).reverse()
    }

    return ticksData
  }, [ticksData, ticksLoading, isXtoY, tickSpacing, xDecimal, yDecimal, currentPairReversed])

  useEffect(() => {
    if (
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      poolIndex === null &&
      progress === 'approvedWithSuccess'
    ) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee,
            tickSpacing
          })
        )
      )
    }
  }, [progress])

  useEffect(() => {
    if (
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      poolIndex !== null &&
      !allPools[poolIndex]
    ) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee,
            tickSpacing
          })
        )
      )
    }
  }, [poolIndex])

  const addTokenHandler = (address: string) => {
    if (
      connection !== null &&
      tokens.findIndex(token => token.address.toString() === address) === -1
    ) {
      getNewTokenOrThrow(address, connection)
        .then(data => {
          dispatch(poolsActions.addTokens(data))

          addNewTokenToLocalStorage(address, currentNetwork)
          dispatch(
            snackbarsActions.add({
              message: 'Token added',
              variant: 'success',
              persist: false
            })
          )
        })
        .catch(() => {
          dispatch(
            snackbarsActions.add({
              message: 'Token add failed',
              variant: 'error',
              persist: false
            })
          )
        })
    } else {
      dispatch(
        snackbarsActions.add({
          message: 'Token already in list',
          variant: 'info',
          persist: false
        })
      )
    }
  }

  const copyPoolAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  const setPositionOpeningMethod = (val: PositionOpeningMethod) => {
    localStorage.setItem('OPENING_METHOD', val)
  }

  const initialHideUnknownTokensValue =
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === 'true' ||
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === null

  const setHideUnknownTokensValue = (val: boolean) => {
    localStorage.setItem('HIDE_UNKNOWN_TOKENS', val ? 'true' : 'false')
  }

  const [triggerFetchPrice, setTriggerFetchPrice] = useState(false)

  const [tokenAPriceData, setTokenAPriceData] = useState<TokenPriceData | undefined>(undefined)

  const [priceALoading, setPriceALoading] = useState(false)
  useEffect(() => {
    if (tokenAIndex === null || (tokenAIndex !== null && !tokens[tokenAIndex])) {
      return
    }

    const addr = tokens[tokenAIndex].address.toString()
    setPriceALoading(true)
    getTokenPrice(addr, currentNetwork)
      .then(data => setTokenAPriceData({ price: data ?? 0 }))
      .catch(() =>
        setTokenAPriceData(getMockedTokenPrice(tokens[tokenAIndex].symbol, currentNetwork))
      )
      .finally(() => setPriceALoading(false))
  }, [tokenAIndex, tokens, triggerFetchPrice])

  const [tokenBPriceData, setTokenBPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceBLoading, setPriceBLoading] = useState(false)
  useEffect(() => {
    if (tokenBIndex === null || (tokenBIndex !== null && !tokens[tokenBIndex])) {
      return
    }

    const addr = tokens[tokenBIndex].address.toString()
    setPriceBLoading(true)
    getTokenPrice(addr, currentNetwork)
      .then(data => setTokenBPriceData({ price: data ?? 0 }))
      .catch(() =>
        setTokenBPriceData(getMockedTokenPrice(tokens[tokenBIndex].symbol, currentNetwork))
      )
      .finally(() => setPriceBLoading(false))
  }, [tokenBIndex, tokens, triggerFetchPrice])

  const initialSlippage =
    localStorage.getItem('INVARIANT_NEW_POSITION_SLIPPAGE') ?? DEFAULT_NEW_POSITION_SLIPPAGE

  const onSlippageChange = (slippage: string) => {
    localStorage.setItem('INVARIANT_NEW_POSITION_SLIPPAGE', slippage)
  }

  const initialMaxPriceImpact =
    localStorage.getItem('INVARIANT_AUTOSWAP_MAX_PRICE_IMPACT') ?? DEFAULT_AUTOSWAP_MAX_PRICE_IMPACT

  const onMaxPriceImpactChange = (priceImpact: string) => {
    localStorage.setItem('INVARIANT_AUTOSWAP_MAX_PRICE_IMPACT', priceImpact)
  }

  const initialMinUtilization =
    localStorage.getItem('INVARIANT_AUTOSWAP_MIN_UTILIZATION') ?? DEFAULT_AUTOSWAP_MIN_UTILIZATION

  const onMinUtilizationChange = (utilization: string) => {
    localStorage.setItem('INVARIANT_AUTOSWAP_MIN_UTILIZATION', utilization)
  }

  const initialMaxSlippageToleranceSwap =
    localStorage.getItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP') ??
    DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP

  const onMaxSlippageToleranceSwapChange = (slippageToleranceSwap: string) => {
    localStorage.setItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP', slippageToleranceSwap)
  }

  const initialMaxSlippageToleranceCreatePosition =
    localStorage.getItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_CREATE_POSITION') ??
    DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_CREATE_POSITION

  const onMaxSlippageToleranceCreatePositionChange = (slippageToleranceCreatePosition: string) => {
    localStorage.setItem(
      'INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_CREATE_POSITION',
      slippageToleranceCreatePosition
    )
  }

  const calcAmount = (amount: BN, left: number, right: number, tokenAddress: PublicKey) => {
    if (tokenAIndex === null || tokenBIndex === null || isNaN(left) || isNaN(right)) {
      return { amount: new BN(0), liquidity: new BN(0) }
    }

    const byX = tokenAddress.equals(
      isXtoY ? tokens[tokenAIndex].assetAddress : tokens[tokenBIndex].assetAddress
    )
    const lowerTick = Math.min(left, right)
    const upperTick = Math.max(left, right)

    try {
      if (byX) {
        const result = getLiquidityByX(
          amount,
          lowerTick,
          upperTick,
          poolIndex !== null ? allPools[poolIndex].sqrtPrice : midPrice.sqrtPrice,
          true
        )
        return { amount: result.y, liquidity: result.liquidity }
      } else {
        const result = getLiquidityByY(
          amount,
          lowerTick,
          upperTick,
          poolIndex !== null ? allPools[poolIndex].sqrtPrice : midPrice.sqrtPrice,
          true
        )
        return { amount: result.x, liquidity: result.liquidity }
      }
    } catch {
      return { amount: new BN(0), liquidity: new BN(0) }
    }
  }

  const unblockUpdatePriceRange = () => {
    dispatch(positionsActions.setShouldNotUpdateRange(false))
  }

  const onRefresh = () => {
    if (!success) {
      dispatch(positionsActions.setShouldNotUpdateRange(true))
    }

    setTriggerFetchPrice(!triggerFetchPrice)

    if (tokenAIndex !== null && tokenBIndex !== null) {
      dispatch(walletActions.getBalance())

      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee,
            tickSpacing
          })
        )
      )

      if (poolIndex !== null) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex,
            isXtoY: allPools[poolIndex].tokenX.equals(
              tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
            )
          })
        )
      }
      if (autoSwapPool) {
        poolsActions.getAutoSwapPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee: ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee,
            tickSpacing:
              ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.tickSpacing ??
              feeToTickSpacing(ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee)
          })
        )
      }
    }
  }

  useEffect(() => {
    if (isTimeoutError) {
      void onRefresh()
      dispatch(connectionActions.setTimeoutError(false))
    }
  }, [isTimeoutError])

  const isPromotedPool = useMemo(() => {
    if (poolIndex === null) {
      return false
    }

    return promotedPools.some(pool => pool.address === allPools[poolIndex].address.toString())
  }, [promotedPools.length, poolIndex, allPools.length])

  const estimatedPointsPerDay: BN = useMemo(() => {
    const poolAddress = poolIndex !== null ? allPools[poolIndex]?.address.toString() : ''

    if (!isPromotedPool || poolIndex === null) {
      return new BN(0)
    }

    const poolPointsPerSecond = promotedPools.find(
      pool => pool.address === poolAddress.toString()
    )!.pointsPerSecond

    const estimatedPoints = estimatePointsForLiquidity(
      liquidity,
      allPools[poolIndex] as PoolStructure,
      new BN(poolPointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
    )

    return estimatedPoints as BN
  }, [liquidity.toString(), poolIndex, isPromotedPool])

  const estimatedPointsForScale = (
    currentConcentration: number,
    concentrationArray: number[]
  ): { min: BN; middle: BN; max: BN } => {
    const poolAddress = poolIndex !== null ? allPools[poolIndex].address.toString() : ''

    if (!isPromotedPool || poolIndex === null) {
      return { min: new BN(0), middle: new BN(0), max: new BN(0) }
    }

    const minLiquidity = new BN(
      sciToString(
        ((+liquidity.toString() / currentConcentration) * concentrationArray[0]).toFixed(0)
      )
    )

    const middleConcentration =
      +concentrationArray[Math.floor(concentrationArray.length / 2)].toFixed(0)
    const midLiquidity = new BN(
      sciToString(((+liquidity.toString() / currentConcentration) * middleConcentration).toFixed(0))
    )

    const maxConcentration = concentrationArray[concentrationArray.length - 1]
    const maxLiquidity = new BN(
      sciToString(((+liquidity.toString() / currentConcentration) * maxConcentration).toFixed(0))
    )

    const poolPointsPerSecond = promotedPools.find(
      pool => pool.address === poolAddress.toString()
    )!.pointsPerSecond

    const estimatedMinPoints = estimatePointsForLiquidity(
      minLiquidity,
      allPools[poolIndex] as PoolStructure,
      new BN(poolPointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
    )

    const estimatedMiddlePoints = estimatePointsForLiquidity(
      midLiquidity,
      allPools[poolIndex] as PoolStructure,
      new BN(poolPointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
    )

    const estimatedMaxPoints = estimatePointsForLiquidity(
      maxLiquidity,
      allPools[poolIndex] as PoolStructure,
      new BN(poolPointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
    )

    return {
      min: estimatedMinPoints as BN,
      middle: estimatedMiddlePoints as BN,
      max: estimatedMaxPoints as BN
    }
  }

  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const isLoadingStats = useSelector(isLoading)

  useEffect(() => {
    dispatch(statsActions.getCurrentIntervalStats({ interval: Intervals.Daily }))
  }, [])

  const { feeTiersWithTvl, totalTvl } = useMemo(() => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return { feeTiersWithTvl: {}, totalTvl: 0 }
    }
    const feeTiersWithTvl: Record<number, number> = {}
    let totalTvl = 0

    poolsList.forEach(pool => {
      const xMatch =
        pool.tokenX.equals(tokens[tokenAIndex ?? 0].assetAddress) &&
        pool.tokenY.equals(tokens[tokenBIndex ?? 0].assetAddress)
      const yMatch =
        pool.tokenX.equals(tokens[tokenBIndex ?? 0].assetAddress) &&
        pool.tokenY.equals(tokens[tokenAIndex ?? 0].assetAddress)

      if (xMatch || yMatch) {
        feeTiersWithTvl[pool.fee] = pool.tvl
        totalTvl += pool.tvl
      }
    })

    return { feeTiersWithTvl, totalTvl }
  }, [poolsList, tokenAIndex, tokenBIndex])

  const autoSwapPool = useMemo(
    () =>
      tokenAIndex !== null && tokenBIndex !== null
        ? autoSwapPools.find(
            item =>
              (item.pair.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
                item.pair.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
              (item.pair.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
                item.pair.tokenY.equals(tokens[tokenAIndex].assetAddress))
          )
        : undefined,
    [tokenAIndex, tokenBIndex]
  )

  useEffect(() => {
    if (tokenAIndex === null || tokenBIndex === null || !autoSwapPool) return
    dispatch(
      poolsActions.getAutoSwapPoolData(
        new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
          fee: ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee,
          tickSpacing:
            ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.tickSpacing ??
            feeToTickSpacing(ALL_FEE_TIERS_DATA[autoSwapPool.swapPool.feeIndex].tier.fee)
        })
      )
    )
  }, [autoSwapPool])

  useEffect(() => {
    if (autoSwapPoolData && tokenAIndex !== null && tokenBIndex !== null) {
      dispatch(
        poolsActions.getTicksAndTickMapForAutoSwap({
          tokenFrom: tokens[tokenAIndex].assetAddress,
          tokenTo: tokens[tokenBIndex].assetAddress,
          autoSwapPool: autoSwapPoolData
        })
      )
    }
  }, [autoSwapPoolData])

  const suggestedPrice = useMemo(() => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return 0
    }

    const feeTiersTVLValues = Object.values(feeTiersWithTvl)
    const bestFee = feeTiersTVLValues.length > 0 ? Math.max(...feeTiersTVLValues) : 0
    const bestTierIndex = ALL_FEE_TIERS_DATA.findIndex(tier => {
      return feeTiersWithTvl[+printBN(tier.tier.fee, DECIMAL - 2)] === bestFee && bestFee > 0
    })

    if (bestTierIndex === -1) {
      return 0
    }

    const poolIndex = allPools.findIndex(
      pool =>
        pool.fee.eq(ALL_FEE_TIERS_DATA[bestTierIndex].tier.fee) &&
        ((pool.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
          pool.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
          (pool.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
            pool.tokenY.equals(tokens[tokenAIndex].assetAddress)))
    )

    if (poolIndex === -1) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee: ALL_FEE_TIERS_DATA[bestTierIndex].tier.fee,
            tickSpacing: ALL_FEE_TIERS_DATA[bestTierIndex].tier.tickSpacing
          })
        )
      )
      return 0
    }

    return poolIndex !== -1
      ? calcPriceBySqrtPrice(allPools[poolIndex].sqrtPrice, isXtoY, xDecimal, yDecimal)
      : 0
  }, [tokenAIndex, tokenBIndex, allPools.length, currentPairReversed])

  const oraclePrice = useMemo(() => {
    if (!tokenAPriceData || !tokenBPriceData) {
      return null
    }
    return tokenAPriceData.price / tokenBPriceData.price
  }, [tokenAPriceData, tokenBPriceData, isXtoY])

  return (
    <NewPosition
      initialTokenFrom={initialTokenFrom}
      initialTokenTo={initialTokenTo}
      initialFee={initialFee}
      initialConcentration={initialConcentration}
      copyPoolAddressHandler={copyPoolAddressHandler}
      poolAddress={poolIndex !== null ? allPools[poolIndex].address.toString() : ''}
      tokens={tokens}
      data={data}
      midPrice={midPrice}
      setMidPrice={setMidPrice}
      onChangePositionTokens={(tokenA, tokenB, feeTierIndex) => {
        if (
          tokenA !== null &&
          tokenB !== null &&
          tokenA !== tokenB &&
          !(
            tokenAIndex === tokenA &&
            tokenBIndex === tokenB &&
            fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
          )
        ) {
          const index = allPools.findIndex(
            pool =>
              pool.fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee) &&
              ((pool.tokenX.equals(tokens[tokenA].assetAddress) &&
                pool.tokenY.equals(tokens[tokenB].assetAddress)) ||
                (pool.tokenX.equals(tokens[tokenB].assetAddress) &&
                  pool.tokenY.equals(tokens[tokenA].assetAddress)))
          )

          if (
            index !== poolIndex &&
            !(
              tokenAIndex === tokenB &&
              tokenBIndex === tokenA &&
              fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
            )
          ) {
            if (isMountedRef.current) {
              setPoolIndex(index !== -1 ? index : null)
              setCurrentPairReversed(null)
            }
          } else if (
            tokenAIndex === tokenB &&
            tokenBIndex === tokenA &&
            fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
          ) {
            if (isMountedRef.current) {
              setCurrentPairReversed(currentPairReversed === null ? true : !currentPairReversed)
            }
          }

          let poolExists = false
          if (currentPoolAddress) {
            poolExists = allPools.some(pool => pool.address.equals(currentPoolAddress))
          }

          if (index !== -1 && index !== poolIndex) {
            dispatch(
              actions.getCurrentPlotTicks({
                poolIndex: index,
                isXtoY: allPools[index].tokenX.equals(tokens[tokenA].assetAddress)
              })
            )
            setPoolIndex(index)
          }

          if (
            ((tokenAIndex !== tokenB && tokenBIndex !== tokenA) ||
              !fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)) &&
            (!poolExists || index === -1)
          ) {
            dispatch(
              poolsActions.getPoolData(
                new Pair(tokens[tokenA].assetAddress, tokens[tokenB].assetAddress, {
                  fee: ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee,
                  tickSpacing: ALL_FEE_TIERS_DATA[feeTierIndex].tier.tickSpacing
                })
              )
            )
          }
        }

        setTokenAIndex(tokenA)
        setTokenBIndex(tokenB)
        setFeeIndex(feeTierIndex)
      }}
      feeTiers={ALL_FEE_TIERS_DATA.map(tier => ({
        feeValue: +printBN(tier.tier.fee, DECIMAL - 2)
      }))}
      isCurrentPoolExisting={
        currentPoolAddress ? allPools.some(pool => pool.address.equals(currentPoolAddress)) : false
      }
      swapAndAddLiquidityHandler={(
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
        leftTickIndex,
        rightTickIndex
      ) => {
        if (
          tokenAIndex === null ||
          tokenBIndex === null ||
          !autoSwapPoolData ||
          poolIndex === null ||
          !allPools[poolIndex] ||
          !autoSwapTickMap ||
          !autoSwapPool
        ) {
          return
        }
        if (poolIndex !== null) {
          dispatch(positionsActions.setShouldNotUpdateRange(true))
        }
        if (progress === 'none') {
          setProgress('progress')
        }

        const lowerTickIndex = Math.min(leftTickIndex, rightTickIndex)
        const upperTickIndex = Math.max(leftTickIndex, rightTickIndex)

        dispatch(
          positionsActions.swapAndInitPosition({
            xAmount,
            yAmount,
            tokenX: tokens[isXtoY ? tokenAIndex : tokenBIndex].assetAddress,
            tokenY: tokens[isXtoY ? tokenBIndex : tokenAIndex].assetAddress,
            swapAmount,
            byAmountIn,
            xToY,
            swapPool: autoSwapPoolData,
            swapPoolTickmap: autoSwapTickMap,
            swapSlippage,
            estimatedPriceAfterSwap,
            crossedTicks,
            positionPair: {
              fee: allPools[poolIndex].fee,
              tickSpacing: allPools[poolIndex].tickSpacing
            },
            positionPoolIndex: poolIndex,
            positionPoolPrice: allPools[poolIndex].sqrtPrice,
            positionSlippage,
            lowerTick: lowerTickIndex,
            upperTick: upperTickIndex,
            liquidityDelta: liquidity,
            minUtilizationPercentage,
            isSamePool: allPools[poolIndex].address.equals(autoSwapPool.swapPool.address)
          })
        )
      }}
      addLiquidityHandler={(leftTickIndex, rightTickIndex, xAmount, yAmount, slippage) => {
        if (tokenAIndex === null || tokenBIndex === null) {
          return
        }
        if (poolIndex !== null) {
          dispatch(positionsActions.setShouldNotUpdateRange(true))
        }
        if (progress === 'none') {
          setProgress('progress')
        }

        const lowerTickIndex = Math.min(leftTickIndex, rightTickIndex)
        const upperTickIndex = Math.max(leftTickIndex, rightTickIndex)

        dispatch(
          positionsActions.initPosition({
            tokenX: tokens[isXtoY ? tokenAIndex : tokenBIndex].assetAddress,
            tokenY: tokens[isXtoY ? tokenBIndex : tokenAIndex].assetAddress,
            fee,
            lowerTick: lowerTickIndex,
            upperTick: upperTickIndex,
            liquidityDelta: liquidity,
            initPool: poolIndex === null,
            initTick: poolIndex === null ? midPrice.index : undefined,
            xAmount: Math.floor(xAmount),
            yAmount: Math.floor(yAmount),
            slippage,
            tickSpacing,
            knownPrice: poolIndex === null ? midPrice.sqrtPrice : allPools[poolIndex].sqrtPrice,
            poolIndex
          })
        )
      }}
      onRefresh={onRefresh}
      isBalanceLoading={isBalanceLoading}
      shouldNotUpdatePriceRange={shouldNotUpdatePriceRange}
      unblockUpdatePriceRange={unblockUpdatePriceRange}
      isGetLiquidityError={false}
      onlyUserPositions={false} //TODO implement logic
      setOnlyUserPositions={() => {}} //TODO implement logic
      network={currentNetwork}
      isLoadingTokens={isCurrentlyLoadingTokens}
      ethBalance={ethBalance}
      walletStatus={walletStatus}
      onConnectWallet={() => {
        dispatch(walletActions.connect(false))
      }}
      onDisconnectWallet={() => {
        dispatch(walletActions.disconnect())
      }}
      calcAmount={calcAmount}
      isLoadingTicksOrTickmap={isLoadingTicksOrTickmap}
      progress={progress}
      isXtoY={isXtoY}
      tickSpacing={tickSpacing}
      xDecimal={xDecimal}
      yDecimal={yDecimal}
      isWaitingForNewPool={isWaitingForNewPool || initialLoader}
      poolIndex={poolIndex}
      currentPairReversed={currentPairReversed}
      currentPriceSqrt={
        poolIndex !== null && !!allPools[poolIndex]
          ? allPools[poolIndex].sqrtPrice
          : calculatePriceSqrt(midPrice.index)
      }
      updateLiquidity={(lq: BN) => setLiquidity(lq)}
      handleAddToken={addTokenHandler}
      commonTokens={commonTokensForNetworks[currentNetwork]}
      initialOpeningPositionMethod={initialOpeningPositionMethod}
      onPositionOpeningMethodChange={setPositionOpeningMethod}
      initialHideUnknownTokensValue={initialHideUnknownTokensValue}
      onHideUnknownTokensChange={setHideUnknownTokensValue}
      tokenAPriceData={tokenAPriceData}
      tokenBPriceData={tokenBPriceData}
      priceALoading={priceALoading}
      priceBLoading={priceBLoading}
      hasTicksError={hasTicksError}
      reloadHandler={() => {
        if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
          dispatch(
            actions.getCurrentPlotTicks({
              poolIndex,
              isXtoY: allPools[poolIndex].tokenX.equals(
                tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
              )
            })
          )
        }
      }}
      currentFeeIndex={feeIndex}
      onSlippageChange={onSlippageChange}
      initialSlippage={initialSlippage}
      canNavigate={canNavigate}
      estimatedPointsPerDay={estimatedPointsPerDay}
      estimatedPointsForScale={estimatedPointsForScale}
      isPromotedPool={isPromotedPool}
      feeTiersWithTvl={feeTiersWithTvl}
      totalTvl={totalTvl}
      isLoadingStats={isLoadingStats}
      autoSwapPoolData={autoSwapPoolData ?? null}
      autoSwapTickmap={autoSwapTickMap}
      autoSwapTicks={autoSwapTicks}
      initialMaxPriceImpact={initialMaxPriceImpact}
      onMaxPriceImpactChange={onMaxPriceImpactChange}
      initialMinUtilization={initialMinUtilization}
      onMinUtilizationChange={onMinUtilizationChange}
      onMaxSlippageToleranceSwapChange={onMaxSlippageToleranceSwapChange}
      initialMaxSlippageToleranceSwap={initialMaxSlippageToleranceSwap}
      onMaxSlippageToleranceCreatePositionChange={onMaxSlippageToleranceCreatePositionChange}
      initialMaxSlippageToleranceCreatePosition={initialMaxSlippageToleranceCreatePosition}
      suggestedPrice={suggestedPrice}
      handleBack={handleBack}
      oraclePrice={oraclePrice}
    />
  )
}

export default NewPositionWrapper
