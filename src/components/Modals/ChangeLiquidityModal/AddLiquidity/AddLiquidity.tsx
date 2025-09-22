import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import {
  ALL_FEE_TIERS_DATA,
  AutoswapCustomError,
  DEFAULT_AUTOSWAP_MAX_PRICE_IMPACT,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY,
  DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP,
  DEFAULT_AUTOSWAP_MIN_UTILIZATION,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  DepositOptions,
  MINIMUM_PRICE_IMPACT,
  NetworkType,
  WRAPPED_ETH_ADDRESS,
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
  simulateAutoSwap,
  simulateAutoSwapOnTheSamePool,
  tickerToAddress,
  trimDecimalZeros,
  trimLeadingZeros
} from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { actions as poolsActions, PoolWithAddress } from '@store/reducers/pools'
import { PlotTickData } from '@store/reducers/positions'
import { Status } from '@store/reducers/solanaWallet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import {
  DECIMAL,
  feeToTickSpacing,
  fromFee,
  getMaxTick,
  getMinTick,
  SimulateSwapAndCreatePositionSimulation,
  SwapAndCreateSimulationStatus,
  toDecimal
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { getMarketAddress, Pair } from '@invariant-labs/sdk-eclipse'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import {
  Box,
  Button,
  Checkbox,
  Grid,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery
} from '@mui/material'
import { blurContent, createButtonActions } from '@utils/uiUtils'
import { useStyles } from './style'
import { theme } from '@static/theme'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { unknownTokenIcon } from '@static/icons'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import DepoSitOptionsModal from '@components/Modals/DepositOptionsModal/DepositOptionsModal'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import loadingAnimation from '@static/gif/loading.gif'
import { InputState } from '@components/NewPosition/DepositSelector/DepositSelector'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import { Info } from '@static/componentIcon/Info'
import { Settings } from '@static/componentIcon/Settings'

export interface IProps {
  tokenFrom: PublicKey
  tokenTo: PublicKey
  fee: BN
  leftRange: number
  rightRange: number
  tokens: {
    assetAddress: PublicKey
    balance: BN
    tokenProgram?: PublicKey
    symbol: string
    address: PublicKey
    decimals: number
    name: string
    logoURI: string
    coingeckoId?: string
    isUnknown?: boolean
  }[]
  walletStatus: Status
  allPools: PoolWithAddress[]
  isBalanceLoading: boolean
  currentNetwork: NetworkType
  ticksLoading: boolean
  getCurrentPlotTicks: () => void
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  getPoolData: (pair: Pair) => void
  setShouldNotUpdateRange: () => void
  autoSwapPoolData: PoolWithAddress | null
  autoSwapTicks: Tick[]
  autoSwapTickMap: Tickmap | null
  isLoadingAutoSwapPool: boolean
  isLoadingAutoSwapPoolTicksOrTickMap: boolean
  ticksData: PlotTickData[]
  changeLiquidity: (
    liquidity: BN,
    slippage: BN,
    isAddLiquidity: boolean,
    xAmount: BN,
    yAmount: BN
  ) => void
  swapAndAddLiquidity: (
    xAmount: BN,
    yAmount: BN,
    swapAmount: BN,
    xToY: boolean,
    byAmountIn: boolean,
    estimatedPriceAfterSwap: BN,
    crossedTicks: number[],
    swapSlippage: BN,
    positionSlippage: BN,
    minUtilizationPercentage: BN,
    poolIndex: number,
    liquidity: BN
  ) => void
  success: boolean
  inProgress: boolean
  setChangeLiquiditySuccess: (value: boolean) => void
  tokenXLiquidity: number
  tokenYLiquidity: number
}

export const AddLiquidity: React.FC<IProps> = ({
  tokenFrom,
  tokenTo,
  fee,
  leftRange,
  rightRange,
  tokens,
  walletStatus,
  allPools,
  currentNetwork,
  ticksLoading,
  isBalanceLoading,
  getCurrentPlotTicks,
  onConnectWallet,
  onDisconnectWallet,
  getPoolData,
  setShouldNotUpdateRange,
  autoSwapPoolData,
  autoSwapTicks,
  autoSwapTickMap,
  isLoadingAutoSwapPool,
  isLoadingAutoSwapPoolTicksOrTickMap,
  ticksData,
  changeLiquidity,
  swapAndAddLiquidity,
  success,
  inProgress,
  setChangeLiquiditySuccess,
  tokenXLiquidity,
  tokenYLiquidity
}) => {
  const dispatch = useDispatch()

  const isLoadingTicksOrTickmap = useMemo(
    () => ticksLoading || isLoadingAutoSwapPoolTicksOrTickMap || isLoadingAutoSwapPool,
    [ticksLoading, isLoadingAutoSwapPoolTicksOrTickMap, isLoadingAutoSwapPool]
  )
  const [liquidity, setLiquidity] = useState<BN>(new BN(0))

  const [poolIndex, setPoolIndex] = useState<number | null>(null)

  const [progress, setProgress] = useState<ProgressState>('none')

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  useEffect(() => {
    setProgress('none')
  }, [poolIndex])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
        getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee,
            tickSpacing
          })
        )
      }

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 500)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
        setChangeLiquiditySuccess(false)
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
    feeTierData => feeTierData.tier.fee.toString() === fee.toString()
  )

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

  useEffect(() => {
    if (tokenAIndex !== null && tokenBIndex !== null && tokenAIndex !== tokenBIndex) {
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
        getCurrentPlotTicks()
      }
    }
  }, [allPools.length])

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
      getPoolData(
        new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
          fee,
          tickSpacing
        })
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
      getPoolData(
        new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
          fee,
          tickSpacing
        })
      )
    }
  }, [poolIndex])

  const [tokenAPriceData, setTokenAPriceData] = useState<TokenPriceData | undefined>(undefined)

  const [priceALoading, setPriceALoading] = useState(false)
  useEffect(() => {
    if (tokenAIndex === null || (tokenAIndex !== null && !tokens[tokenAIndex])) {
      return
    }

    const addr = tokens[tokenAIndex].address.toString()
    setPriceALoading(true)
    getTokenPrice(currentNetwork, addr)
      .then(data => setTokenAPriceData({ price: data ?? 0 }))
      .catch(() =>
        setTokenAPriceData(getMockedTokenPrice(tokens[tokenAIndex].symbol, currentNetwork))
      )
      .finally(() => setPriceALoading(false))
  }, [tokenAIndex, tokens])

  const [tokenBPriceData, setTokenBPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceBLoading, setPriceBLoading] = useState(false)
  useEffect(() => {
    if (tokenBIndex === null || (tokenBIndex !== null && !tokens[tokenBIndex])) {
      return
    }

    const addr = tokens[tokenBIndex].address.toString()
    setPriceBLoading(true)
    getTokenPrice(currentNetwork, addr)
      .then(data => setTokenBPriceData({ price: data ?? 0 }))
      .catch(() =>
        setTokenBPriceData(getMockedTokenPrice(tokens[tokenBIndex].symbol, currentNetwork))
      )
      .finally(() => setPriceBLoading(false))
  }, [tokenBIndex, tokens])

  const initialSlippage =
    localStorage.getItem('INVARIANT_NEW_POSITION_SLIPPAGE') ?? DEFAULT_NEW_POSITION_SLIPPAGE

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

  const initialMaxSlippageToleranceAddLiquidity =
    localStorage.getItem('INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY') ??
    DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY

  const onMaxSlippageToleranceAddLiquidityChange = (slippageToleranceAddLiquidity: string) => {
    localStorage.setItem(
      'INVARIANT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_ADD_LIQUIDITY',
      slippageToleranceAddLiquidity
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

  const [isAutoSwapAvailable, setIsAutoSwapAvailable] = useState(false)

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [tokenACheckbox, setTokenACheckbox] = useState<boolean>(true)
  const [tokenBCheckbox, setTokenBCheckbox] = useState<boolean>(true)

  const [alignment, setAlignment] = useState<DepositOptions>(DepositOptions.Basic)

  const [slippTolerance] = React.useState<string>(initialSlippage)

  const isCurrentPoolExisting = currentPoolAddress
    ? allPools.some(pool => pool.address.equals(currentPoolAddress))
    : false

  useEffect(() => {
    if (isLoadingTicksOrTickmap) return
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
  }, [tokenAIndex, tokenBIndex, isCurrentPoolExisting, isLoadingTicksOrTickmap])

  const isAutoswapOn = useMemo(() => alignment == DepositOptions.Auto, [alignment])

  useEffect(() => {
    if (isAutoSwapAvailable) {
      setAlignment(DepositOptions.Auto)
    } else if (!isAutoSwapAvailable && alignment === DepositOptions.Auto) {
      setAlignment(DepositOptions.Basic)
    }
  }, [isAutoSwapAvailable])

  const poolAddress = poolIndex !== null ? allPools[poolIndex].address.toString() : ''

  const isAutoSwapOnTheSamePool = useMemo(
    () =>
      poolAddress.length > 0 &&
      autoSwapPools.some(item => item.swapPool.address.toString() === poolAddress),
    [poolAddress]
  )

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
      const amount = isAutoswapOn
        ? tokenBDeposit
        : getOtherTokenAmount(
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
      const amount = isAutoswapOn
        ? tokenADeposit
        : getOtherTokenAmount(
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

  const [lastPoolIndex, setLastPoolIndex] = useState<number | null>(poolIndex)

  useEffect(() => {
    if (poolIndex != lastPoolIndex) {
      setLastPoolIndex(lastPoolIndex)
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

  const simulationParams = useMemo(() => {
    return {
      price: midPrice.sqrtPrice,
      lowerTickIndex: Math.min(leftRange, rightRange),
      upperTickIndex: Math.max(leftRange, rightRange)
    }
  }, [leftRange, rightRange, midPrice])

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

  const blocked =
    tokenAIndex === null || tokenBIndex === null || tokenAIndex === tokenBIndex || data.length === 0

  const isPriceWarningVisible = blocked && !isLoadingTicksOrTickmap

  const addLiquidityHandler = (xAmount, yAmount, slippage) => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return
    }
    if (poolIndex !== null) {
      setShouldNotUpdateRange()
    }
    if (progress === 'none') {
      setProgress('progress')
    }

    changeLiquidity(liquidity, slippage, true, xAmount, yAmount)
  }

  const onAddLiquidity = async (xAmount, yAmount) => {
    if (tokenAIndex !== null && tokenBIndex !== null) {
      addLiquidityHandler(fromFee(new BN(Number(+slippTolerance * 1000))), xAmount, yAmount)
    }
  }

  const swapAndAddLiquidityHandler = (
    xAmount,
    yAmount,
    swapAmount,
    xToY,
    byAmountIn,
    estimatedPriceAfterSwap,
    crossedTicks,
    swapSlippage,
    positionSlippage,
    minUtilizationPercentage
  ) => {
    if (
      tokenAIndex === null ||
      tokenBIndex === null ||
      !autoSwapPoolData ||
      poolIndex === null ||
      !allPools[poolIndex] ||
      !autoSwapTickMap ||
      !autoSwapPool ||
      !simulation ||
      !simulation.swapInput ||
      !simulation.swapSimulation
    ) {
      return
    }
    if (poolIndex !== null) {
      setShouldNotUpdateRange()
    }
    if (progress === 'none') {
      setProgress('progress')
    }

    swapAndAddLiquidity(
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
    )
  }

  const onSwapAndAddLiquidity = async (
    xAmount,
    yAmount,
    swapAmount,
    xToY,
    byAmountIn,
    estimatedPriceAfterSwap,
    crossedTicks,
    swapSlippage,
    positionSlippage,
    minUtilizationPercentage
  ) => {
    if (isPriceWarningVisible) {
      blurContent()
      const ok = confirm('The price can be inncorect')
      if (!ok) return
    }
    swapAndAddLiquidityHandler(
      xAmount,
      yAmount,
      swapAmount,
      xToY,
      byAmountIn,
      estimatedPriceAfterSwap,
      crossedTicks,
      swapSlippage,
      positionSlippage,
      minUtilizationPercentage
    )
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

      let poolExists = false
      if (currentPoolAddress) {
        poolExists = allPools.some(pool => pool.address.equals(currentPoolAddress))
      }

      if (index !== -1 && index !== poolIndex) {
        getCurrentPlotTicks()
        setPoolIndex(index)
      }

      if (
        ((tokenAIndex !== tokenB && tokenBIndex !== tokenA) ||
          !fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)) &&
        (!poolExists || index === -1)
      ) {
        getPoolData(
          new Pair(tokens[tokenA].assetAddress, tokens[tokenB].assetAddress, {
            fee: ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee,
            tickSpacing: ALL_FEE_TIERS_DATA[feeTierIndex].tier.tickSpacing
          })
        )
      }
    }

    setTokenAIndex(tokenA)
    setTokenBIndex(tokenB)
  }

  const { classes, cx } = useStyles()

  const isSm = useMediaQuery(theme.breakpoints.down(370))

  const tokenAInputState = {
    value:
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      blockedToken === PositionTokenBlock.A &&
      alignment === DepositOptions.Basic
        ? '0'
        : tokenADeposit,
    setValue: value => {
      if (tokenAIndex === null) {
        return
      }

      setTokenADeposit(value)
      !isAutoswapOn &&
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
        blockedToken === PositionTokenBlock.A &&
        alignment === DepositOptions.Basic) ||
      !tokenACheckbox,

    blockerInfo:
      alignment === DepositOptions.Basic
        ? 'Range only for single-asset deposit'
        : 'You chose not to spend this token',
    decimalsLimit: tokenAIndex !== null ? tokens[tokenAIndex].decimals : 0
  } as InputState
  const { value: valueA } = tokenAInputState
  const tokenBInputState = {
    value:
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      blockedToken === PositionTokenBlock.B &&
      alignment === DepositOptions.Basic
        ? '0'
        : tokenBDeposit,
    setValue: value => {
      if (tokenBIndex === null) {
        return
      }

      setTokenBDeposit(value)
      !isAutoswapOn &&
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
        blockedToken === PositionTokenBlock.B &&
        alignment === DepositOptions.Basic) ||
      !tokenBCheckbox,
    blockerInfo:
      alignment === DepositOptions.Basic
        ? 'Range only for single-asset deposit'
        : 'You chose not to spend this token',
    decimalsLimit: tokenBIndex !== null ? tokens[tokenBIndex].decimals : 0
  } as InputState
  const { value: valueB } = tokenBInputState
  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [autoswapCustomError, setAutoswapCustomError] = useState<AutoswapCustomError | null>(null)
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)
  const [slippageToleranceSwap, setSlippageToleranceSwap] = useState<string>(
    initialMaxSlippageToleranceSwap
  )
  const [slippageToleranceAddLiquidity, setSlippageToleranceAddLiquidity] = useState<string>(
    initialMaxSlippageToleranceAddLiquidity
  )

  const [throttle, setThrottle] = useState<boolean>(false)

  const [simulation, setSimulation] = useState<SimulateSwapAndCreatePositionSimulation | null>(null)

  const [settings, setSettings] = useState<boolean>(false)

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
    const tokenFromAddress = tickerToAddress(currentNetwork, tokenFrom.toString())
    const tokenToAddress = tickerToAddress(currentNetwork, tokenTo.toString())

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
      if (feeTierData.tier.fee.toString() === fee.toString()) {
        feeTierIndexFromPath = index
      }
    })
    setTokenAIndex(tokenAIndexFromPath)
    setTokenBIndex(tokenBIndexFromPath)
    setPositionTokens(tokenAIndexFromPath, tokenBIndexFromPath, feeTierIndexFromPath)

    if (tokenAIndexFromPath !== null && tokenBIndexFromPath !== null) {
      setIsLoaded(true)
    }
  }, [tokens.length, tokenFrom, tokenTo])

  const isPriceImpact = useMemo(
    () =>
      simulation &&
      simulation.swapSimulation &&
      simulation.swapSimulation.priceImpact.gt(toDecimal(+Number(priceImpact).toFixed(4), 2)),
    [simulation, priceImpact]
  )

  const getButtonMessage = useCallback(() => {
    if (isLoadingTicksOrTickmap || throttle || isSimulating) {
      return 'Loading'
    }

    if (tokenAIndex === null || tokenBIndex === null) {
      return 'Select tokens'
    }

    if (tokenAIndex === tokenBIndex) {
      return 'Select different tokens'
    }

    if (isAutoswapOn && autoswapCustomError === AutoswapCustomError.FetchError) {
      return 'Fetch error'
    }

    if (
      isAutoswapOn &&
      (isSimulationStatus(SwapAndCreateSimulationStatus.TickAccountMissing) ||
        isSimulationStatus(SwapAndCreateSimulationStatus.InvalidSimulationParamsError))
    ) {
      return 'Invalid parameters'
    }

    if (
      isAutoswapOn &&
      (isSimulationStatus(SwapAndCreateSimulationStatus.SwapNotFound) ||
        isSimulationStatus(SwapAndCreateSimulationStatus.InputAmountTooLow))
    ) {
      return 'Token amounts are too low'
    }

    if (isAutoswapOn && isSimulationStatus(SwapAndCreateSimulationStatus.LiquidityTooLow)) {
      return 'Insufficient Liquidity'
    }

    if (isAutoswapOn && isPriceImpact) {
      return 'Price impact reached'
    }

    if (isAutoswapOn && isSimulationStatus(SwapAndCreateSimulationStatus.PriceLimitReached)) {
      return 'Price limit reached'
    }

    if (isAutoswapOn && isSimulationStatus(SwapAndCreateSimulationStatus.UtilizationTooLow)) {
      return 'Minimal utilization not reached'
    }

    if (isAutoswapOn && !tokenACheckbox && !tokenBCheckbox) {
      return 'At least one checkbox needs to be marked'
    }

    if (
      !tokenAInputState.blocked &&
      tokenACheckbox &&
      convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals).gt(
        tokens[tokenAIndex].balance
      )
    ) {
      return `Not enough ${tokens[tokenAIndex].symbol}`
    }

    if (
      !tokenBInputState.blocked &&
      tokenBCheckbox &&
      convertBalanceToBN(tokenBInputState.value, tokens[tokenBIndex].decimals).gt(
        tokens[tokenBIndex].balance
      )
    ) {
      return `Not enough ${tokens[tokenBIndex].symbol}`
    }

    if (
      ((tokenAInputState.blocked && !tokenBInputState.blocked) ||
        (!tokenAInputState.blocked && tokenBInputState.blocked)) &&
      isAutoswapOn
    ) {
      if (
        (tokenAInputState.blocked && +tokenBInputState.value === 0) ||
        (tokenBInputState.blocked && +tokenAInputState.value === 0)
      ) {
        return 'Enter token amount'
      }
    }

    if (
      !tokenAInputState.blocked &&
      +tokenAInputState.value === 0 &&
      !tokenBInputState.blocked &&
      +tokenBInputState.value === 0 &&
      !isAutoswapOn
    ) {
      return !tokenAInputState.blocked &&
        !tokenBInputState.blocked &&
        +tokenAInputState.value === 0 &&
        +tokenBInputState.value === 0
        ? 'Enter token amounts'
        : 'Enter token amount'
    }

    if (
      !tokenAInputState.blocked &&
      +tokenAInputState.value === 0 &&
      !tokenBInputState.blocked &&
      +tokenBInputState.value === 0 &&
      isAutoswapOn
    ) {
      return 'Enter token amount'
    }

    return 'Add Liquidity'
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

  const handleClickDepositOptions = () => {
    setSettings(true)
  }

  const handleCloseDepositOptions = () => {
    setSettings(false)
  }

  const setMaxPriceImpact = (priceImpact: string): void => {
    setPriceImpact(priceImpact)
    onMaxPriceImpactChange(priceImpact)
  }

  const setMinUtilization = (utilization: string): void => {
    setUtilization(utilization)
    onMinUtilizationChange(utilization)
  }

  const setMaxSlippageToleranceSwap = (slippageToleranceSwap: string): void => {
    setSlippageToleranceSwap(slippageToleranceSwap)
    onMaxSlippageToleranceSwapChange(slippageToleranceSwap)
  }

  const setMaxSlippageToleranceAddLiquidity = (slippageToleranceAddLiquidity: string): void => {
    setSlippageToleranceAddLiquidity(slippageToleranceAddLiquidity)
    onMaxSlippageToleranceAddLiquidityChange(slippageToleranceAddLiquidity)
  }

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

  const handleSwitchDepositType = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: DepositOptions | null
  ) => {
    if (newAlignment !== null) {
      if (newAlignment === DepositOptions.Basic) {
        setSimulation(null)
      }
      setAlignment(newAlignment)
    }
  }

  const actionsTokenA = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: new BN(0),
    onAmountSet: tokenAInputState.setValue
  })
  const actionsTokenB = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: new BN(0),
    onAmountSet: tokenBInputState.setValue
  })

  const isSimulationStatus = useCallback(
    (value: SwapAndCreateSimulationStatus) => {
      return simulation && simulation.status === value
    },
    [simulation]
  )

  const renderSwitcher = useCallback(
    () => (
      <Box className={classes.switchDepositContainer}>
        <Box className={classes.switchDepositTypeContainer}>
          <Box
            className={classes.switchDepositTypeMarker}
            sx={{
              left: !isAutoswapOn ? 0 : '50%'
            }}
          />
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleSwitchDepositType}
            className={classes.switchDepositTypeButtonsGroup}>
            <ToggleButton
              value={DepositOptions.Basic}
              disableRipple
              className={cx(
                classes.switchDepositTypeButton,
                !isAutoswapOn ? classes.switchSelected : classes.switchNotSelected
              )}>
              Basic
            </ToggleButton>
            <ToggleButton
              disabled={!isAutoSwapAvailable}
              value={DepositOptions.Auto}
              disableRipple
              className={cx(
                classes.switchDepositTypeButton,
                classes.autoButton,
                isAutoswapOn ? classes.switchSelected : classes.switchNotSelected
              )}>
              <TooltipHover
                title={
                  'AutoSwap allows you to add liquidity to a position using any token ratio. Simply choose the amount you currently hold in your wallet, and it will be automatically swapped in the most optimal way.'
                }
                increasePadding
                removeOnMobile>
                <span>Auto</span>
              </TooltipHover>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TooltipHover
          title={
            !isAutoswapOn
              ? 'Autoswap related settings, accessible only when autoswap is turned on.'
              : ''
          }>
          <Box
            display='flex'
            alignItems='center'
            onClick={() => {
              if (isAutoswapOn) {
                handleClickDepositOptions()
              }
            }}
            style={{ cursor: 'pointer' }}>
            <Button
              className={classes.optionsIconBtn}
              disableRipple
              style={!isAutoswapOn ? { pointerEvents: 'none' } : {}}>
              <Box className={!isAutoswapOn ? classes.grayscaleIcon : classes.whiteIcon}>
                <Settings />
              </Box>
            </Button>
          </Box>
        </TooltipHover>
      </Box>
    ),
    [isAutoSwapAvailable, alignment]
  )

  const renderWarning = useCallback(() => {
    if (isSimulating || throttle) {
      return (
        <Box position='relative'>
          <Skeleton variant='rectangular' className={classes.skeleton}></Skeleton>
          <img src={loadingAnimation} alt='Loader' className={classes.loadingAnimation} />
        </Box>
      )
    }
    if (!simulation) {
      return <></>
    }

    if (isSimulationStatus(SwapAndCreateSimulationStatus.PerfectRatio)) {
      return (
        <Box className={classes.unknownWarning}>
          <div style={{ marginBottom: '-1.5px', marginRight: '4px' }}>
            <TooltipHover title={'You already have enough tokens to open position'}>
              <Info style={{ height: 20, width: 20 }} />
            </TooltipHover>
          </div>
          No swap required
        </Box>
      )
    }

    if (isSimulationStatus(SwapAndCreateSimulationStatus.LiquidityTooLow)) {
      return (
        <Box className={classes.errorWarning}>
          <div style={{ marginBottom: '-1.5px', marginRight: '4px' }}>
            <TooltipHover title={'There is not enough liquidity to perform the swap'}>
              <Info style={{ height: 20, width: 20 }} />
            </TooltipHover>
          </div>
          Insufficient liquidity
        </Box>
      )
    }

    const invalidParameters =
      isSimulationStatus(SwapAndCreateSimulationStatus.TickAccountMissing) ||
      isSimulationStatus(SwapAndCreateSimulationStatus.InvalidSimulationParamsError) ||
      isSimulationStatus(SwapAndCreateSimulationStatus.SwapNotFound) ||
      isSimulationStatus(SwapAndCreateSimulationStatus.InputAmountTooLow)

    if (invalidParameters) {
      return (
        <Box className={classes.errorWarning}>
          <TooltipHover title={'Unable to perform autoswap and open a position'}>
            <Box display='flex' alignItems='center'>
              <div style={{ marginBottom: '-1.5px', marginRight: '4px' }}>
                <Info style={{ height: 20, width: 20 }} />
              </div>
              Invalid parameters
            </Box>
          </TooltipHover>
        </Box>
      )
    }

    return (
      <Box className={isPriceImpact ? classes.errorWarning : classes.unknownWarning}>
        <TooltipHover
          title={
            <>
              The price impact resulting from a swap that rebalances the token ratio before a
              liquidity is added to the position.
              {isPriceImpact ? (
                <>
                  {' '}
                  In order to add liquidity to position you have to change swap price impact
                  tolerance in the settings.
                </>
              ) : (
                ''
              )}
            </>
          }>
          <Box display='flex' alignItems='center'>
            {isSm ? 'Impact:' : 'Price impact:'}{' '}
            {simulation.swapSimulation!.priceImpact.gt(new BN(MINIMUM_PRICE_IMPACT))
              ? Number(
                  printBN(new BN(simulation.swapSimulation!.priceImpact), DECIMAL - 2)
                ).toFixed(2)
              : `<${Number(printBN(MINIMUM_PRICE_IMPACT, DECIMAL - 2)).toFixed(2)}`}
            %
          </Box>
        </TooltipHover>
      </Box>
    )
  }, [
    isSimulating,
    simulation,
    alignment,
    tokenACheckbox,
    tokenBCheckbox,
    throttle,
    isPriceImpact,
    isSm
  ])

  const simulateAutoSwapResult = async () => {
    setIsSimulating(true)
    if (autoswapCustomError !== null) {
      setAutoswapCustomError(null)
    }
    if (tokenAIndex === null || tokenBIndex === null || isLoadingTicksOrTickmap) {
      setSimulation(null)
      setIsSimulating(false)
      return
    }
    if (!autoSwapPoolData || !autoSwapTicks || !autoSwapTickMap || !simulationParams.price) {
      setAutoswapCustomError(AutoswapCustomError.FetchError)
      setSimulation(null)
      setIsSimulating(false)
      return
    }
    const tokenADecimal = tokens[tokenAIndex].decimals
    const tokenBDecimal = tokens[tokenBIndex].decimals
    const tokenAValue = tokenACheckbox ? convertBalanceToBN(valueA, tokenADecimal) : new BN(0)
    const tokenBValue = tokenBCheckbox ? convertBalanceToBN(valueB, tokenBDecimal) : new BN(0)
    if (tokenAValue.eqn(0) && tokenBValue.eqn(0)) {
      setSimulation(null)
      setIsSimulating(false)
      return
    }
    const amountX = autoSwapPoolData.tokenX.equals(tokens[tokenAIndex].assetAddress)
      ? tokenAValue
      : tokenBValue
    const amountY = autoSwapPoolData.tokenY.equals(tokens[tokenBIndex].assetAddress)
      ? tokenBValue
      : tokenAValue
    let result: SimulateSwapAndCreatePositionSimulation | null = null
    if (isAutoSwapOnTheSamePool) {
      result = await simulateAutoSwapOnTheSamePool(
        amountX,
        amountY,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickMap,
        toDecimal(+Number(slippageToleranceSwap).toFixed(4), 2),
        simulationParams.lowerTickIndex,
        simulationParams.upperTickIndex,
        toDecimal(+Number(utilization).toFixed(4), 2)
      )
    } else {
      result = await simulateAutoSwap(
        amountX,
        amountY,
        autoSwapPoolData,
        autoSwapTicks,
        autoSwapTickMap,
        toDecimal(+Number(slippageToleranceSwap).toFixed(4), 2),
        toDecimal(+Number(slippageToleranceAddLiquidity).toFixed(4), 2),
        simulationParams.lowerTickIndex,
        simulationParams.upperTickIndex,
        simulationParams.price,
        toDecimal(+Number(utilization).toFixed(4), 2)
      )
    }
    if (result) {
      updateLiquidity(result.position.liquidity)
    }
    setSimulation(result)
    setIsSimulating(false)
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
    if ((tokenACheckbox || tokenBCheckbox) && isAutoswapOn) {
      simulateWithTimeout()
    }
  }, [
    alignment,
    simulationParams,
    tokenACheckbox,
    tokenBCheckbox,
    autoSwapPoolData,
    autoSwapTickMap,
    autoSwapTicks,
    isLoadingTicksOrTickmap,
    priceImpact,
    slippageToleranceAddLiquidity,
    slippageToleranceSwap,
    utilization,
    valueA,
    valueB
  ])

  return (
    <Grid container className={cx(classes.wrapper, classes.deposit)}>
      <DepoSitOptionsModal
        initialMaxPriceImpact={initialMaxPriceImpact}
        setMaxPriceImpact={setMaxPriceImpact}
        initialMinUtilization={initialMinUtilization}
        setMinUtilization={setMinUtilization}
        initialMaxSlippageToleranceSwap={initialMaxSlippageToleranceSwap}
        setMaxSlippageToleranceSwap={setMaxSlippageToleranceSwap}
        initialMaxSlippageToleranceCreatePosition={initialMaxSlippageToleranceAddLiquidity}
        setMaxSlippageToleranceCreatePosition={setMaxSlippageToleranceAddLiquidity}
        handleClose={handleCloseDepositOptions}
        open={settings}
      />
      <Grid container className={classes.depositHeader}>
        <Box className={classes.depositHeaderContainer}>
          <Typography className={classes.subsectionTitle}>Amount</Typography>

          <Box className={classes.depositOptions}>
            {isAutoswapOn &&
              isAutoSwapAvailable &&
              (tokenACheckbox || tokenBCheckbox) &&
              renderWarning()}
            {renderSwitcher()}
          </Box>
        </Box>
      </Grid>
      <Grid container className={classes.sectionWrapper}>
        <Box className={classes.inputWrapper}>
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: isAutoswapOn ? '31px' : '0px',
              opacity: isAutoswapOn ? 1 : 0
            }}>
            <TooltipHover
              title={
                tokenACheckbox
                  ? 'Unmark to exclude this token as liquidity available for use'
                  : 'Mark to include this token as liquidity available for use'
              }>
              <Checkbox
                checked={tokenACheckbox}
                onChange={e => setTokenACheckbox(e.target.checked)}
                className={classes.checkbox}
                icon={<span className={classes.customIcon} />}
              />
            </TooltipHover>
          </Box>
          <DepositAmountInput
            tokenPrice={tokenAPriceData?.price}
            currency={tokenAIndex !== null ? tokens[tokenAIndex].symbol : null}
            currencyIconSrc={tokenAIndex !== null ? tokens[tokenAIndex].logoURI : undefined}
            currencyIsUnknown={
              tokenAIndex !== null ? (tokens[tokenAIndex].isUnknown ?? false) : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  actionsTokenA.max(tokenAIndex)
                },
                variant: 'max'
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  actionsTokenA.half(tokenAIndex)
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
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: isAutoswapOn ? '31px' : '0px',
              opacity: isAutoswapOn ? 1 : 0
            }}>
            {' '}
            <TooltipHover
              title={
                tokenBCheckbox
                  ? 'Unmark to exclude this token as liquidity available for use'
                  : 'Mark to include this token as liquidity available for use'
              }>
              <Checkbox
                checked={tokenBCheckbox}
                onChange={e => {
                  setTokenBCheckbox(e.target.checked)
                }}
                className={classes.checkbox}
                icon={<span className={classes.customIcon} />}
              />
            </TooltipHover>
          </Box>
          <DepositAmountInput
            tokenPrice={tokenBPriceData?.price}
            currency={tokenBIndex !== null ? tokens[tokenBIndex].symbol : null}
            currencyIconSrc={tokenBIndex !== null ? tokens[tokenBIndex].logoURI : undefined}
            currencyIsUnknown={
              tokenBIndex !== null ? (tokens[tokenBIndex].isUnknown ?? false) : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                variant: 'max',
                onClick: () => {
                  actionsTokenB.max(tokenBIndex)
                }
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  actionsTokenB.half(tokenBIndex)
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
      <Box className={classes.statCard}>
        <Box className={classes.statRow}>
          <Typography className={classes.statTitle}>Position after deposit:</Typography>
          <Typography className={classes.statContent}>
            {tokenAIndex !== null
              ? formatNumberWithoutSuffix(
                  tokenXLiquidity +
                    (isAutoswapOn
                      ? +printBN(simulation?.position.x, xDecimal)
                      : +tokenAInputState.value)
                )
              : 0}{' '}
            {tokenAIndex !== null ? (
              <img
                className={classes.smallIcon}
                src={tokens[tokenAIndex].logoURI}
                alt={`${tokens[tokenAIndex].name} icon`}
              />
            ) : (
              <img className={classes.smallIcon} src={unknownTokenIcon} alt='unknown icon' />
            )}
            {' + '}
            {tokenBIndex !== null
              ? formatNumberWithoutSuffix(
                  tokenYLiquidity +
                    (isAutoswapOn
                      ? +printBN(simulation?.position.y, yDecimal)
                      : +tokenBInputState.value)
                )
              : 0}{' '}
            {tokenBIndex !== null ? (
              <img
                className={classes.smallIcon}
                src={tokens[tokenBIndex].logoURI}
                alt={`${tokens[tokenBIndex].name} icon`}
              />
            ) : (
              <img className={classes.smallIcon} src={unknownTokenIcon} alt='unknown icon' />
            )}
          </Typography>
        </Box>
        <Box className={classes.statRow}>
          <Typography className={classes.statTitle}>Total deposit:</Typography>
          <Typography className={classes.statContent}>
            $
            {formatNumberWithoutSuffix(
              (tokenAPriceData?.price ?? 0) * +tokenAInputState.value +
                (tokenBPriceData?.price ?? 0) * +tokenBInputState.value
            )}
          </Typography>
        </Box>
      </Box>
      <Box width='100%'>
        {walletStatus !== Status.Initialized ? (
          <ChangeWalletButton
            margin={'24px 0 0 0'}
            width={'100%'}
            height={40}
            name='Connect wallet'
            onConnect={onConnectWallet}
            connected={false}
            onDisconnect={onDisconnectWallet}
            noUnblur
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
                  if (progress === 'none' && tokenAIndex !== null && tokenBIndex !== null) {
                    onAddLiquidity(
                      isXtoY
                        ? convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                        : convertBalanceToBN(valueA, tokens[tokenAIndex].decimals),
                      isXtoY
                        ? convertBalanceToBN(valueA, tokens[tokenAIndex].decimals)
                        : convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                    )
                  }
                }}
                disabled={getButtonMessage() !== 'Add Liquidity'}
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
                if (!isAutoswapOn) {
                  onAddLiquidity(
                    isXtoY
                      ? convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                      : convertBalanceToBN(valueA, tokens[tokenAIndex].decimals),
                    isXtoY
                      ? convertBalanceToBN(valueA, tokens[tokenAIndex].decimals)
                      : convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                  )
                } else if (
                  isAutoswapOn &&
                  isSimulationStatus(SwapAndCreateSimulationStatus.PerfectRatio)
                ) {
                  onAddLiquidity(
                    isXtoY
                      ? convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                      : convertBalanceToBN(valueA, tokens[tokenAIndex].decimals),
                    isXtoY
                      ? convertBalanceToBN(valueA, tokens[tokenAIndex].decimals)
                      : convertBalanceToBN(valueB, tokens[tokenBIndex].decimals)
                  )
                } else {
                  if (
                    (tokenACheckbox || tokenBCheckbox) &&
                    simulation &&
                    simulation.swapSimulation &&
                    simulation.swapInput &&
                    isSimulationStatus(SwapAndCreateSimulationStatus.Ok) &&
                    !!autoSwapPoolData
                  ) {
                    const userMinUtilization = toDecimal(+Number(utilization).toFixed(4), 2)
                    const tokenADecimal = tokens[tokenAIndex].decimals
                    const tokenBDecimal = tokens[tokenBIndex].decimals
                    const tokenAValue = tokenACheckbox
                      ? convertBalanceToBN(valueA, tokenADecimal)
                      : new BN(0)
                    const tokenBValue = tokenBCheckbox
                      ? convertBalanceToBN(valueB, tokenBDecimal)
                      : new BN(0)
                    const amountX = autoSwapPoolData.tokenX.equals(tokens[tokenAIndex].assetAddress)
                      ? tokenAValue
                      : tokenBValue
                    const amountY = autoSwapPoolData.tokenY.equals(tokens[tokenBIndex].assetAddress)
                      ? tokenBValue
                      : tokenAValue

                    onSwapAndAddLiquidity(
                      amountX,
                      amountY,
                      simulation.swapInput.swapAmount,
                      simulation.swapInput.xToY,
                      simulation.swapInput.byAmountIn,
                      simulation.swapSimulation.priceAfterSwap,
                      simulation.swapSimulation.crossedTicks,
                      toDecimal(+Number(slippageToleranceSwap).toFixed(4), 2),
                      toDecimal(+Number(slippageToleranceAddLiquidity).toFixed(4), 2),
                      userMinUtilization
                    )
                  }
                }
              }
            }}
            disabled={getButtonMessage() !== 'Add Liquidity'}
            content={getButtonMessage()}
            progress={progress}
          />
        )}
      </Box>
    </Grid>
  )
}

export default AddLiquidity
