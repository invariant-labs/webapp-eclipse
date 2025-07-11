import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import {
  ALL_FEE_TIERS_DATA,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  DepositOptions,
  Intervals,
  REFRESHER_INTERVAL,
  autoSwapPools
} from '@store/consts/static'
import { TokenPriceData } from '@store/consts/types'
import {
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  convertBalanceToBN,
  createPlaceholderLiquidityPlot,
  determinePositionTokenBlock,
  formatNumberWithoutSuffix,
  getMockedTokenPrice,
  getScaleFromString,
  getTokenPrice,
  PositionTokenBlock,
  printBN,
  tickerToAddress,
  trimDecimalZeros,
  trimLeadingZeros
} from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions, actions as positionsActions } from '@store/reducers/positions'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { network, timeoutError } from '@store/selectors/solanaConnection'
import poolsSelectors, {
  isLoadingLatestPoolsForTransaction,
  isLoadingPathTokens,
  poolsArraySortedByFees
} from '@store/selectors/pools'
import { initPosition, plotTicks } from '@store/selectors/positions'
import { balanceLoading, status, poolTokens } from '@store/selectors/solanaWallet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { getCurrentSolanaConnection, networkTypetoProgramNetwork } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import {
  DECIMAL,
  feeToTickSpacing,
  fromFee,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { DENOMINATOR, getMarketAddress, Pair } from '@invariant-labs/sdk-eclipse'
import {
  getLiquidityByX,
  getLiquidityByY,
  getMaxLiquidityWithPercentage
} from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as statsActions } from '@store/reducers/stats'
import { poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { Box, Grid, Typography } from '@mui/material'
import { blurContent } from '@utils/uiUtils'
import { useStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import { InputState } from '@components/NewPosition/DepositSelector/DepositSelector'
import { PercentageSlider } from './PercentageSlider/PercentageSlider'

export interface IProps {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: BN
  leftRange: number
  rightRange: number
  tokenXLiquidity: number
  tokenYLiquidity: number
}

export const RemoveLiquidity: React.FC<IProps> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  leftRange,
  rightRange,
  tokenXLiquidity,
  tokenYLiquidity
}) => {
  const dispatch = useDispatch()
  const connection = getCurrentSolanaConnection()
  const tokens = useSelector(poolTokens)
  const walletStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const isLoadingAutoSwapPool = useSelector(poolsSelectors.isLoadingAutoSwapPool)
  const isLoadingAutoSwapPoolTicksOrTickMap = useSelector(
    poolsSelectors.isLoadingAutoSwapPoolTicksOrTickMap
  )
  const isBalanceLoading = useSelector(balanceLoading)
  const currentNetwork = useSelector(network)
  const { success, inProgress } = useSelector(initPosition)
  const { allData: ticksData, loading: ticksLoading } = useSelector(plotTicks)

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

  const [initialLoader, setInitialLoader] = useState(true)
  const isMountedRef = useRef(false)
  const isTimeoutError = useSelector(timeoutError)
  const isPathTokensLoading = useSelector(isLoadingPathTokens)
  const { state } = useLocation()
  const [block, setBlock] = useState(state?.referer === 'stats')

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

  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  clearTimeout(urlUpdateTimeoutRef.current)

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
            isXtoY: allPools[poolIndex].tokenX.equals(tokens[tokenAIndex].assetAddress),
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

  const feeIndex = ALL_FEE_TIERS_DATA.findIndex(
    feeTierData => feeTierData.tier.fee.toString() === initialFee.toString()
  )

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

    return ticksData
  }, [ticksData, ticksLoading, isXtoY, tickSpacing, xDecimal, yDecimal])

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
            isXtoY: allPools[poolIndex].tokenX.equals(tokens[tokenAIndex].assetAddress)
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

  const poolsList = useSelector(poolsStatsWithTokensDetails)

  useEffect(() => {
    dispatch(statsActions.getCurrentIntervalStats({ interval: Intervals.Daily }))
  }, [])

  const { feeTiersWithTvl } = useMemo(() => {
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
  }, [tokenAIndex, tokenBIndex, allPools.length])

  const oraclePrice = useMemo(() => {
    if (!tokenAPriceData || !tokenBPriceData) {
      return null
    }
    return tokenAPriceData.price / tokenBPriceData.price
  }, [tokenAPriceData, tokenBPriceData, isXtoY])

  const [isAutoSwapAvailable, setIsAutoSwapAvailable] = useState(false)

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [tokenACheckbox, setTokenACheckbox] = useState<boolean>(true)
  const [tokenBCheckbox, setTokenBCheckbox] = useState<boolean>(true)

  const [alignment, setAlignment] = useState<DepositOptions>(DepositOptions.Basic)

  const [slippTolerance] = React.useState<string>(initialSlippage)

  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)

  const isCurrentPoolExisting = currentPoolAddress
    ? allPools.some(pool => pool.address.equals(currentPoolAddress))
    : false

  useEffect(() => {
    if (isLoadingTicksOrTickmap || isWaitingForNewPool) return
    setIsAutoSwapAvailable(
      tokenAIndex !== null &&
        tokenBIndex !== null &&
        autoSwapPools.some(
          item =>
            (item.pair.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
              item.pair.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (item.pair.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              item.pair.tokenY.equals(tokens[tokenAIndex].assetAddress))
        ) &&
        isCurrentPoolExisting
    )
  }, [
    tokenAIndex,
    tokenBIndex,
    isCurrentPoolExisting,
    isWaitingForNewPool,
    isLoadingTicksOrTickmap
  ])

  useEffect(() => {
    if (isAutoSwapAvailable) {
      setAlignment(DepositOptions.Auto)
    } else if (!isAutoSwapAvailable && alignment === DepositOptions.Auto) {
      setAlignment(DepositOptions.Basic)
    }
  }, [isAutoSwapAvailable])

  const updateLiquidity = (lq: BN) => setLiquidity(lq)

  const getOtherTokenAmount = (amount: BN, left: number, right: number, byFirst: boolean) => {
    const printIndex = byFirst ? tokenBIndex : tokenAIndex
    const calcIndex = byFirst ? tokenAIndex : tokenBIndex
    if (printIndex === null || calcIndex === null) {
      return '0.0'
    }
    const result = calcAmount(amount, left, right, tokens[calcIndex].assetAddress)
    updateLiquidity(result.liquidity)
    return trimLeadingZeros(printBN(result.amount, tokens[printIndex].decimals))
  }

  const getTicksInsideRange = (left: number, right: number, isXtoY: boolean) => {
    const leftMax = isXtoY ? getMinTick(tickSpacing) : getMaxTick(tickSpacing)
    const rightMax = isXtoY ? getMaxTick(tickSpacing) : getMinTick(tickSpacing)

    let leftInRange: number
    let rightInRange: number

    if (isXtoY) {
      leftInRange = left < leftMax ? leftMax : left
      rightInRange = right > rightMax ? rightMax : right
    } else {
      leftInRange = left > leftMax ? leftMax : left
      rightInRange = right < rightMax ? rightMax : right
    }

    return { leftInRange, rightInRange }
  }

  const onChangeRange = (left: number, right: number) => {
    const { leftInRange, rightInRange } = getTicksInsideRange(left, right, isXtoY)
    const leftRange = leftInRange
    const rightRange = rightInRange

    if (
      tokenAIndex !== null &&
      tokenADeposit !== '0' &&
      (isXtoY ? rightRange > midPrice.index : rightRange < midPrice.index)
    ) {
      const deposit = tokenADeposit
      const amount = getOtherTokenAmount(
        convertBalanceToBN(deposit, tokens[tokenAIndex].decimals),
        leftRange,
        rightRange,
        true
      )

      if (tokenBIndex !== null && +deposit !== 0) {
        setTokenADeposit(deposit)
        setTokenBDeposit(amount)
        return
      }
    } else if (tokenBIndex !== null) {
      const deposit = tokenBDeposit
      const amount = getOtherTokenAmount(
        convertBalanceToBN(deposit, tokens[tokenBIndex].decimals),
        leftRange,
        rightRange,
        false
      )

      if (tokenAIndex !== null && +deposit !== 0) {
        setTokenBDeposit(deposit)
        setTokenADeposit(amount)
      }
    }
  }

  const currentPriceSqrt =
    poolIndex !== null && !!allPools[poolIndex]
      ? allPools[poolIndex].sqrtPrice
      : calculatePriceSqrt(midPrice.index)

  useEffect(() => {
    onChangeRange(leftRange, rightRange)
  }, [midPrice.index, leftRange, rightRange, currentPriceSqrt.toString()])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0 && isCurrentPoolExisting) {
        setRefresherTime(refresherTime - 1)
      } else if (isCurrentPoolExisting) {
        onRefresh()
        setRefresherTime(REFRESHER_INTERVAL)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime, poolIndex])

  const [lastPoolIndex, setLastPoolIndex] = useState<number | null>(poolIndex)

  useEffect(() => {
    if (poolIndex != lastPoolIndex) {
      setLastPoolIndex(lastPoolIndex)
      setRefresherTime(REFRESHER_INTERVAL)
    }
  }, [poolIndex])

  const blockedToken = useMemo(
    () =>
      determinePositionTokenBlock(
        currentPriceSqrt,
        Math.min(leftRange, rightRange),
        Math.max(leftRange, rightRange),
        isXtoY
      ),
    [leftRange, rightRange, currentPriceSqrt]
  )

  useEffect(() => {
    if (tokenAIndex === null || tokenBIndex === null) return
    if (alignment === DepositOptions.Auto) {
      setTokenACheckbox(true)
      setTokenBCheckbox(true)
      return
    }
    if (
      (!tokenACheckbox || Number(tokenADeposit) === 0) &&
      (!tokenBCheckbox || Number(tokenBDeposit) === 0)
    ) {
      setTokenADeposit('0')
      setTokenBDeposit('0')
      setTokenACheckbox(true)
      setTokenBCheckbox(true)
      return
    }
    if (
      (!tokenACheckbox || Number(tokenADeposit) === 0) &&
      tokenBCheckbox &&
      Number(tokenBDeposit) > 0
    ) {
      setTokenADeposit(
        getOtherTokenAmount(
          convertBalanceToBN(tokenBDeposit, tokens[tokenBIndex].decimals),
          leftRange,
          rightRange,
          false
        )
      )
      setTokenACheckbox(true)
      setTokenBCheckbox(true)
      return
    }
    if (
      (!tokenBCheckbox || Number(tokenBDeposit) === 0) &&
      tokenACheckbox &&
      Number(tokenADeposit) > 0
    ) {
      setTokenBDeposit(
        getOtherTokenAmount(
          convertBalanceToBN(tokenADeposit, tokens[tokenAIndex].decimals),
          leftRange,
          rightRange,
          true
        )
      )
      setTokenACheckbox(true)
      setTokenBCheckbox(true)
      return
    }
    setTokenACheckbox(true)
    setTokenBCheckbox(true)

    const { amount: secondValueBasedOnTokenA, liquidity: liquidityBasedOnTokenA } = calcAmount(
      convertBalanceToBN(tokenADeposit, tokens[tokenAIndex].decimals),
      leftRange,
      rightRange,
      tokens[tokenAIndex].assetAddress
    )
    const isBalanceEnoughForFirstCase =
      secondValueBasedOnTokenA.lt(tokens[tokenBIndex].balance) &&
      convertBalanceToBN(tokenADeposit, tokens[tokenAIndex].decimals).lt(
        tokens[tokenAIndex].balance
      )

    const { amount: secondValueBasedOnTokenB, liquidity: liquidityBasedOnTokenB } = calcAmount(
      convertBalanceToBN(tokenBDeposit, tokens[tokenBIndex].decimals),
      leftRange,
      rightRange,
      tokens[tokenBIndex].assetAddress
    )
    const isBalanceEnoughForSecondCase =
      secondValueBasedOnTokenB.lt(tokens[tokenAIndex].balance) &&
      convertBalanceToBN(tokenBDeposit, tokens[tokenBIndex].decimals).lt(
        tokens[tokenBIndex].balance
      )

    if (isBalanceEnoughForFirstCase && isBalanceEnoughForSecondCase) {
      if (liquidityBasedOnTokenA.gt(liquidityBasedOnTokenB)) {
        setTokenBDeposit(
          trimLeadingZeros(printBN(secondValueBasedOnTokenA, tokens[tokenBIndex].decimals))
        )
        updateLiquidity(liquidityBasedOnTokenA)
        return
      }
      setTokenADeposit(
        trimLeadingZeros(printBN(secondValueBasedOnTokenB, tokens[tokenAIndex].decimals))
      )
      updateLiquidity(liquidityBasedOnTokenB)
      return
    }
    if (!isBalanceEnoughForFirstCase && !isBalanceEnoughForSecondCase) {
      if (liquidityBasedOnTokenA.gt(liquidityBasedOnTokenB)) {
        setTokenADeposit(
          trimLeadingZeros(printBN(secondValueBasedOnTokenB, tokens[tokenAIndex].decimals))
        )
        updateLiquidity(liquidityBasedOnTokenB)
        return
      }
      setTokenBDeposit(
        trimLeadingZeros(printBN(secondValueBasedOnTokenA, tokens[tokenBIndex].decimals))
      )
      updateLiquidity(liquidityBasedOnTokenA)
      return
    }
    if (isBalanceEnoughForFirstCase) {
      setTokenBDeposit(
        trimLeadingZeros(printBN(secondValueBasedOnTokenA, tokens[tokenBIndex].decimals))
      )
      updateLiquidity(liquidityBasedOnTokenA)
      return
    }
    setTokenADeposit(
      trimLeadingZeros(printBN(secondValueBasedOnTokenB, tokens[tokenAIndex].decimals))
    )
    updateLiquidity(liquidityBasedOnTokenB)
  }, [alignment])

  const oracleDiffPercentage = useMemo(() => {
    if (oraclePrice === null || midPrice.x === 0) {
      return 0
    }
    return Math.abs((oraclePrice - midPrice.x) / midPrice.x) * 100
  }, [oraclePrice, midPrice.x])

  const oraclePriceWarning = useMemo(
    () => oraclePrice !== 0 && oracleDiffPercentage > 10,
    [oracleDiffPercentage]
  )

  const diffPercentage = useMemo(() => {
    return Math.abs((suggestedPrice - midPrice.x) / midPrice.x) * 100
  }, [suggestedPrice, midPrice.x])

  const showPriceWarning = useMemo(
    () => (diffPercentage > 10 && !oraclePrice) || (diffPercentage > 10 && oraclePriceWarning),
    [diffPercentage, oraclePriceWarning, oraclePrice]
  )
  const blocked =
    tokenAIndex === null ||
    tokenBIndex === null ||
    tokenAIndex === tokenBIndex ||
    data.length === 0 ||
    isWaitingForNewPool

  const isPriceWarningVisible =
    (showPriceWarning || oraclePriceWarning) && !blocked && !isLoadingTicksOrTickmap

  const addLiquidityHandler = (leftTickIndex, rightTickIndex, xAmount, yAmount, slippage) => {
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
  }

  const onAddLiquidity = async () => {
    if (isPriceWarningVisible) {
      blurContent()
      const ok = await confirm()
      if (!ok) return
    }
    if (tokenAIndex !== null && tokenBIndex !== null) {
      const tokenADecimals = tokens[tokenAIndex].decimals
      const tokenBDecimals = tokens[tokenBIndex].decimals
      addLiquidityHandler(
        leftRange,
        rightRange,
        isXtoY
          ? convertBalanceToBN(tokenADeposit, tokenADecimals)
          : convertBalanceToBN(tokenBDeposit, tokenBDecimals),
        isXtoY
          ? convertBalanceToBN(tokenBDeposit, tokenBDecimals)
          : convertBalanceToBN(tokenADeposit, tokenADecimals),
        fromFee(new BN(Number(+slippTolerance * 1000)))
      )
    }
  }

  const onChangePositionTokens = (tokenA, tokenB, feeTierIndex) => {
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
  }

  const onConnectWallet = () => {
    dispatch(walletActions.connect(false))
  }

  const onDisconnectWallet = () => {
    dispatch(walletActions.disconnect())
  }

  const { classes, cx } = useStyles()

  const tokenAInputState = {
    value:
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      !isWaitingForNewPool &&
      blockedToken === PositionTokenBlock.A &&
      alignment === DepositOptions.Basic
        ? '0'
        : tokenADeposit,
    setValue: value => {
      if (tokenAIndex === null) {
        return
      }

      setTokenADeposit(value)
      setTokenBDeposit(
        getOtherTokenAmount(
          convertBalanceToBN(value, tokens[tokenAIndex].decimals),
          leftRange,
          rightRange,
          true
        )
      )
    },
    blocked:
      (tokenAIndex !== null &&
        tokenBIndex !== null &&
        !isWaitingForNewPool &&
        blockedToken === PositionTokenBlock.A &&
        alignment === DepositOptions.Basic) ||
      !tokenACheckbox ||
      tokenXLiquidity === 0,
    blockerInfo:
      alignment === DepositOptions.Basic
        ? 'Range only for single-asset deposit'
        : 'You chose not to spend this token',
    decimalsLimit: tokenAIndex !== null ? tokens[tokenAIndex].decimals : 0
  } as InputState
  const tokenBInputState = {
    value:
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      !isWaitingForNewPool &&
      blockedToken === PositionTokenBlock.B &&
      alignment === DepositOptions.Basic
        ? '0'
        : tokenBDeposit,
    setValue: value => {
      if (tokenBIndex === null) {
        return
      }

      setTokenBDeposit(value)
      setTokenADeposit(
        getOtherTokenAmount(
          convertBalanceToBN(value, tokens[tokenBIndex].decimals),
          leftRange,
          rightRange,
          false
        )
      )
    },
    blocked:
      (tokenAIndex !== null &&
        tokenBIndex !== null &&
        !isWaitingForNewPool &&
        blockedToken === PositionTokenBlock.B &&
        alignment === DepositOptions.Basic) ||
      !tokenBCheckbox ||
      tokenYLiquidity === 0,
    blockerInfo:
      alignment === DepositOptions.Basic
        ? 'Range only for single-asset deposit'
        : 'You chose not to spend this token',
    decimalsLimit: tokenBIndex !== null ? tokens[tokenBIndex].decimals : 0
  } as InputState

  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const setPositionTokens = (index1, index2, fee) => {
    setTokenAIndex(index1)
    setTokenBIndex(index2)
    onChangePositionTokens(index1, index2, fee)
  }

  useEffect(() => {
    if (isLoaded || tokens.length === 0 || ALL_FEE_TIERS_DATA.length === 0) {
      return
    }
    let feeTierIndexFromPath = 0
    let tokenAIndexFromPath: null | number = null
    let tokenBIndexFromPath: null | number = null
    const tokenFromAddress = tickerToAddress(currentNetwork, initialTokenFrom)
    const tokenToAddress = tickerToAddress(currentNetwork, initialTokenTo)

    const tokenFromIndex = tokens.findIndex(
      token => token.assetAddress.toString() === tokenFromAddress
    )

    const tokenToIndex = tokens.findIndex(token => token.assetAddress.toString() === tokenToAddress)

    if (
      tokenFromAddress !== null &&
      tokenFromIndex !== -1 &&
      (tokenToAddress === null || tokenToIndex === -1)
    ) {
      tokenAIndexFromPath = tokenFromIndex
    } else if (
      tokenFromAddress !== null &&
      tokenToIndex !== -1 &&
      tokenToAddress !== null &&
      tokenFromIndex !== -1
    ) {
      tokenAIndexFromPath = tokenFromIndex
      tokenBIndexFromPath = tokenToIndex
    }

    ALL_FEE_TIERS_DATA.forEach((feeTierData, index) => {
      if (feeTierData.tier.fee.toString() === initialFee.toString()) {
        feeTierIndexFromPath = index
      }
    })
    setTokenAIndex(tokenAIndexFromPath)
    setTokenBIndex(tokenBIndexFromPath)
    setPositionTokens(tokenAIndexFromPath, tokenBIndexFromPath, feeTierIndexFromPath)

    if (tokenAIndexFromPath !== null && tokenBIndexFromPath !== null) {
      setIsLoaded(true)
    }
  }, [tokens.length, initialTokenFrom, initialTokenTo])

  const [wasRunTokenA, setWasRunTokenA] = useState(false)
  const [wasRunTokenB, setWasRunTokenB] = useState(false)

  useEffect(() => {
    if (canNavigate) {
      const tokenAIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(currentNetwork, initialTokenFrom)
      )
      if (!wasRunTokenA && tokenAIndex !== -1) {
        setTokenAIndex(tokenAIndex)
        setWasRunTokenA(true)
      }

      const tokenBIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(currentNetwork, initialTokenTo)
      )
      if (!wasRunTokenB && tokenBIndex !== -1) {
        setTokenBIndex(tokenBIndex)
        setWasRunTokenB(true)
      }
    }
  }, [wasRunTokenA, wasRunTokenB, canNavigate, tokens.length])

  const getButtonMessage = useCallback(() => {
    if (isLoadingTicksOrTickmap) {
      return 'Loading'
    }

    if (tokenAIndex === null || tokenBIndex === null) {
      return 'Select tokens'
    }

    if (tokenAIndex === tokenBIndex) {
      return 'Select different tokens'
    }

    if (
      (!tokenAInputState.blocked &&
        tokenACheckbox &&
        convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals).gt(
          convertBalanceToBN(tokenXLiquidity.toString(), tokens[tokenAIndex].decimals)
        )) ||
      (!tokenBInputState.blocked &&
        tokenBCheckbox &&
        convertBalanceToBN(tokenBInputState.value, tokens[tokenBIndex].decimals).gt(
          convertBalanceToBN(tokenYLiquidity.toString(), tokens[tokenBIndex].decimals)
        ))
    ) {
      return `Not enough ${tokens[tokenAIndex].symbol} and ${tokens[tokenBIndex].symbol}`
    }

    if (
      !tokenAInputState.blocked &&
      +tokenAInputState.value === 0 &&
      !tokenBInputState.blocked &&
      +tokenBInputState.value === 0
    ) {
      return !tokenAInputState.blocked &&
        !tokenBInputState.blocked &&
        +tokenAInputState.value === 0 &&
        +tokenBInputState.value === 0
        ? 'Enter token amounts'
        : 'Enter token amount'
    }

    return 'Remove Liquidity'
  }, [
    isAutoSwapAvailable,
    tokenACheckbox,
    tokenBCheckbox,
    tokenAIndex,
    tokenBIndex,
    tokenAInputState,
    tokenBInputState,
    tokens,
    feeIndex,
    isLoadingTicksOrTickmap
  ])

  useEffect(() => {
    if (tokenAIndex !== null) {
      if (getScaleFromString(tokenAInputState.value) > tokens[tokenAIndex].decimals) {
        const parts = tokenAInputState.value.split('.')

        tokenAInputState.setValue(parts[0] + '.' + parts[1].slice(0, tokens[tokenAIndex].decimals))
      }
    }

    if (tokenBIndex !== null) {
      if (getScaleFromString(tokenBInputState.value) > tokens[tokenBIndex].decimals) {
        const parts = tokenBInputState.value.split('.')

        tokenAInputState.setValue(parts[0] + '.' + parts[1].slice(0, tokens[tokenBIndex].decimals))
      }
    }
  }, [poolIndex])

  const [depositPercentage, setDepositPercentage] = useState(0)
  const [isSlider, setIsSlider] = useState(false)

  useEffect(() => {
    if (tokenAIndex !== null && tokenBIndex !== null && isSlider) {
      const balanceA = tokenXLiquidity
      const balanceB = tokenYLiquidity
      const decimalA = tokens[tokenAIndex].decimals
      const decimalB = tokens[tokenBIndex].decimals

      const [lowerTick, upperTick] = isXtoY ? [leftRange, rightRange] : [rightRange, leftRange]
      const [x, y] = isXtoY ? [balanceA, balanceB] : [balanceB, balanceA]
      const [decimalX, decimalY] = isXtoY ? [decimalA, decimalB] : [decimalB, decimalA]

      try {
        const values = getMaxLiquidityWithPercentage(
          new BN(x * 10 ** xDecimal),

          new BN(y * 10 ** yDecimal),
          lowerTick,
          upperTick,
          currentPriceSqrt,
          new BN(DENOMINATOR).mul(new BN(depositPercentage)).div(new BN(100))
        )

        if (!(x < 0 || y < 0)) {
          setTokenADeposit(
            trimLeadingZeros(isXtoY ? printBN(values.x, decimalX) : printBN(values.y, decimalY))
          )
          setTokenBDeposit(
            trimLeadingZeros(isXtoY ? printBN(values.y, decimalY) : printBN(values.x, decimalX))
          )
        } else {
          setTokenADeposit('0')
          setTokenBDeposit('0')
        }
      } catch (e) {
        console.log(e)
      }
    }
  }, [
    tokenAIndex,
    tokenBIndex,
    leftRange,
    rightRange,
    currentPriceSqrt,
    isBalanceLoading,
    walletStatus,
    depositPercentage
  ])

  useEffect(() => {
    setIsSlider(false)
    setDepositPercentage(Math.round((+tokenADeposit / tokenXLiquidity) * 100))
  }, [tokenADeposit])

  return (
    <Grid container className={cx(classes.wrapper, classes.deposit)}>
      <Grid container className={classes.depositHeader}>
        <Box className={classes.depositHeaderContainer}>
          <Typography className={classes.subsectionTitle}>Amount</Typography>
          <Box className={classes.sliderContainer}>
            <Typography className={classes.sliderValue}>0%</Typography>
            <Box className={classes.slider}>
              <PercentageSlider
                value={depositPercentage}
                onChange={value => {
                  setDepositPercentage(value)
                  setIsSlider(true)
                }}
              />
            </Box>
            <Typography className={classes.sliderValue}>100%</Typography>
          </Box>
        </Box>
      </Grid>
      <Grid container className={classes.sectionWrapper}>
        <Box className={classes.inputWrapper}>
          <DepositAmountInput
            tokenPrice={tokenAPriceData?.price}
            currency={tokenAIndex !== null ? tokens[tokenAIndex].symbol : null}
            currencyIconSrc={tokenAIndex !== null ? tokens[tokenAIndex].logoURI : undefined}
            currencyIsUnknown={
              tokenAIndex !== null ? tokens[tokenAIndex].isUnknown ?? false : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  setDepositPercentage(100)
                },
                variant: 'max'
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  setDepositPercentage(50)
                }
              }
            ]}
            balanceValue={
              tokenAIndex !== null
                ? printBN(tokens[tokenAIndex].balance, tokens[tokenAIndex].decimals)
                : ''
            }
            onBlur={() => {
              if (
                tokenAIndex !== null &&
                tokenBIndex !== null &&
                tokenAInputState.value.length === 0
              ) {
                tokenAInputState.setValue('0.0')
              }
              tokenAInputState.setValue(trimDecimalZeros(tokenAInputState.value))
            }}
            {...tokenAInputState}
            value={tokenACheckbox ? tokenAInputState.value : '0'}
            priceLoading={priceALoading}
            isBalanceLoading={isBalanceLoading}
            walletUninitialized={walletStatus !== Status.Initialized}
          />
        </Box>
        <Box className={classes.inputWrapper}>
          <DepositAmountInput
            tokenPrice={tokenBPriceData?.price}
            currency={tokenBIndex !== null ? tokens[tokenBIndex].symbol : null}
            currencyIconSrc={tokenBIndex !== null ? tokens[tokenBIndex].logoURI : undefined}
            currencyIsUnknown={
              tokenBIndex !== null ? tokens[tokenBIndex].isUnknown ?? false : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  setDepositPercentage(100)
                },
                variant: 'max'
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  setDepositPercentage(50)
                }
              }
            ]}
            balanceValue={
              tokenBIndex !== null
                ? printBN(tokens[tokenBIndex].balance, tokens[tokenBIndex].decimals)
                : ''
            }
            onBlur={() => {
              if (
                tokenAIndex !== null &&
                tokenBIndex !== null &&
                tokenBInputState.value.length === 0
              ) {
                tokenBInputState.setValue('0.0')
              }

              tokenBInputState.setValue(trimDecimalZeros(tokenBInputState.value))
            }}
            {...tokenBInputState}
            value={tokenBCheckbox ? tokenBInputState.value : '0'}
            priceLoading={priceBLoading}
            isBalanceLoading={isBalanceLoading}
            walletUninitialized={walletStatus !== Status.Initialized}
          />
        </Box>
      </Grid>
      <Box className={classes.totalDepositCard}>
        <Typography className={classes.totalDepositTitle}>Total withdraw</Typography>
        <Typography className={classes.totalDepositContent}>
          $
          {formatNumberWithoutSuffix(
            (tokenAPriceData?.price ?? 0) * +tokenAInputState.value +
              (tokenBPriceData?.price ?? 0) * +tokenBInputState.value
          )}
        </Typography>
      </Box>
      <Box width='100%'>
        {walletStatus !== Status.Initialized ? (
          <ChangeWalletButton
            margin={'24px 0 0 0'}
            width={'100%'}
            height={48}
            name='Connect wallet'
            onConnect={onConnectWallet}
            connected={false}
            onDisconnect={onDisconnectWallet}
          />
        ) : getButtonMessage() === 'Insufficient ETH' ? (
          <TooltipHover
            fullSpan
            title='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
            top={-10}>
            <Box width={'100%'}>
              <AnimatedButton
                className={cx(
                  classes.addButton,
                  progress === 'none' ? classes.hoverButton : undefined
                )}
                onClick={() => {
                  if (progress === 'none') {
                    onAddLiquidity()
                  }
                }}
                disabled={getButtonMessage() !== 'Remove Liquidity'}
                content={getButtonMessage()}
                progress={progress}
              />
            </Box>
          </TooltipHover>
        ) : (
          <AnimatedButton
            className={cx(classes.addButton, progress === 'none' ? classes.hoverButton : undefined)}
            onClick={() => {
              if (progress === 'none' && tokenAIndex !== null && tokenBIndex !== null) {
                onAddLiquidity()
              }
            }}
            disabled={getButtonMessage() !== 'Remove Liquidity'}
            content={getButtonMessage()}
            progress={progress}
          />
        )}
      </Box>
    </Grid>
  )
}

export default RemoveLiquidity
