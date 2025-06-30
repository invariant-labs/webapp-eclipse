import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@common/Refresher/Refresher'
import { Box, Button, Fade, Grid, Hidden, Typography, useMediaQuery } from '@mui/material'
import {
  ADDRESSES_TO_REVERT_TOKEN_PAIRS,
  ALL_FEE_TIERS_DATA,
  autoSwapPools,
  DepositOptions,
  NetworkType,
  PositionTokenBlock,
  promotedTiers,
  REFRESHER_INTERVAL,
  USDC_MAIN,
  USDT_MAIN
} from '@store/consts/static'
import {
  addressToTicker,
  calcPriceByTickIndex,
  calculateConcentration,
  calculateConcentrationRange,
  convertBalanceToBN,
  determinePositionTokenBlock,
  getConcentrationIndex,
  initialXtoY,
  parseFeeToPathFee,
  printBN,
  ROUTES,
  trimLeadingZeros,
  validConcentrationMidPriceTick
} from '@utils/utils'
import { PlotTickData } from '@store/reducers/positions'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { VariantType } from 'notistack'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConcentrationTypeSwitch from './ConcentrationTypeSwitch/ConcentrationTypeSwitch'
import DepositSelector from './DepositSelector/DepositSelector'
import MarketIdLabel from './MarketIdLabel/MarketIdLabel'
import PoolInit from './PoolInit/PoolInit'
import RangeSelector from './RangeSelector/RangeSelector'
import useStyles from './style'
import { PositionOpeningMethod, TokenPriceData } from '@store/consts/types'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  DECIMAL,
  fromFee,
  getConcentrationArray,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { backIcon, newTabIcon, refreshIcon, settingIcon } from '@static/icons'
import FAQModal from '@components/Modals/FAQModal/FAQModal'
import EstimatedPoints from './EstimatedPoints/EstimatedPoints'
import { theme } from '@static/theme'
import PointsLabel from './EstimatedPoints/PointsLabel'
import { PoolWithAddress } from '@store/reducers/pools'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import { Button as MuiButton } from '@mui/material'

export interface INewPosition {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
  initialConcentration: string
  poolAddress: string
  copyPoolAddressHandler: (message: string, variant: VariantType) => void
  tokens: SwapToken[]
  data: PlotTickData[]
  midPrice: InitMidPrice
  setMidPrice: (mid: InitMidPrice) => void
  addLiquidityHandler: (
    leftTickIndex: number,
    rightTickIndex: number,
    xAmount: BN,
    yAmount: BN,
    slippage: BN
  ) => void
  swapAndAddLiquidityHandler: (
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
    leftTickIndex: number,
    rightTickIndex: number
  ) => void
  onChangePositionTokens: (
    tokenAIndex: number | null,
    tokenBindex: number | null,
    feeTierIndex: number
  ) => void
  isCurrentPoolExisting: boolean
  calcAmount: (
    amount: BN,
    leftRangeTickIndex: number,
    rightRangeTickIndex: number,
    tokenAddress: PublicKey
  ) => { amount: BN; liquidity: BN }
  feeTiers: Array<{
    feeValue: number
  }>
  isLoadingTicksOrTickmap: boolean
  progress: ProgressState
  isXtoY: boolean
  xDecimal: number
  yDecimal: number
  tickSpacing: number
  isWaitingForNewPool: boolean
  poolIndex: number | null
  currentPairReversed: boolean | null
  currentPriceSqrt: BN
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialOpeningPositionMethod: PositionOpeningMethod
  onPositionOpeningMethodChange: (val: PositionOpeningMethod) => void
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  tokenAPriceData?: TokenPriceData
  tokenBPriceData?: TokenPriceData
  priceALoading?: boolean
  priceBLoading?: boolean
  hasTicksError?: boolean
  reloadHandler: () => void
  currentFeeIndex: number
  onSlippageChange: (slippage: string) => void
  initialSlippage: string
  onRefresh: () => void
  isBalanceLoading: boolean
  shouldNotUpdatePriceRange: boolean
  unblockUpdatePriceRange: () => void
  isGetLiquidityError: boolean
  onlyUserPositions: boolean
  setOnlyUserPositions: (val: boolean) => void
  network: NetworkType
  isLoadingTokens: boolean
  ethBalance: BN
  walletStatus: Status
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  canNavigate: boolean
  estimatedPointsPerDay: BN
  estimatedPointsForScale: (
    currentConcentration: number,
    concentrationArray: number[]
  ) => { min: BN; middle: BN; max: BN }
  isPromotedPool: boolean
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  isLoadingStats: boolean
  autoSwapPoolData: PoolWithAddress | null
  autoSwapTickmap: Tickmap | null
  autoSwapTicks: Tick[] | null
  initialMaxPriceImpact: string
  onMaxPriceImpactChange: (val: string) => void
  initialMinUtilization: string
  onMinUtilizationChange: (val: string) => void
  onMaxSlippageToleranceSwapChange: (val: string) => void
  initialMaxSlippageToleranceSwap: string
  onMaxSlippageToleranceCreatePositionChange: (val: string) => void
  initialMaxSlippageToleranceCreatePosition: string
  updateLiquidity: (lq: BN) => void
  suggestedPrice: number
  handleBack: () => void
  oraclePrice: number | null
}

export const NewPosition: React.FC<INewPosition> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  initialConcentration,
  poolAddress,
  copyPoolAddressHandler,
  tokens,
  data,
  midPrice,
  setMidPrice,
  addLiquidityHandler,
  progress = 'progress',
  onChangePositionTokens,
  isCurrentPoolExisting,
  calcAmount,
  updateLiquidity,
  feeTiers,
  isLoadingTicksOrTickmap,
  isXtoY,
  xDecimal,
  yDecimal,
  tickSpacing,
  isWaitingForNewPool,
  poolIndex,
  currentPairReversed,
  handleAddToken,
  commonTokens,
  initialOpeningPositionMethod,
  onPositionOpeningMethodChange,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  tokenAPriceData,
  tokenBPriceData,
  priceALoading,
  priceBLoading,
  hasTicksError,
  reloadHandler,
  currentFeeIndex,
  onSlippageChange,
  initialSlippage,
  currentPriceSqrt,
  onRefresh,
  isBalanceLoading,
  shouldNotUpdatePriceRange,
  unblockUpdatePriceRange,
  isGetLiquidityError,
  onlyUserPositions,
  setOnlyUserPositions,
  network,
  isLoadingTokens,
  ethBalance,
  walletStatus,
  onConnectWallet,
  onDisconnectWallet,
  canNavigate,
  estimatedPointsPerDay,
  estimatedPointsForScale,
  isPromotedPool,
  feeTiersWithTvl,
  totalTvl,
  isLoadingStats,
  autoSwapPoolData,
  autoSwapTickmap,
  autoSwapTicks,
  initialMaxPriceImpact,
  onMaxPriceImpactChange,
  initialMinUtilization,
  onMinUtilizationChange,
  swapAndAddLiquidityHandler,
  onMaxSlippageToleranceSwapChange,
  initialMaxSlippageToleranceSwap,
  onMaxSlippageToleranceCreatePositionChange,
  initialMaxSlippageToleranceCreatePosition,
  suggestedPrice,
  handleBack,
  oraclePrice
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const [isAutoSwapAvailable, setIsAutoSwapAvailable] = useState(false)

  const [positionOpeningMethod, setPositionOpeningMethod] = useState<PositionOpeningMethod>(
    initialOpeningPositionMethod
  )

  const [leftRange, setLeftRange] = useState(getMinTick(tickSpacing))
  const [rightRange, setRightRange] = useState(getMaxTick(tickSpacing))

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [tokenACheckbox, setTokenACheckbox] = useState<boolean>(true)
  const [tokenBCheckbox, setTokenBCheckbox] = useState<boolean>(true)

  const [alignment, setAlignment] = useState<DepositOptions>(DepositOptions.Basic)

  const [settings, setSettings] = React.useState<boolean>(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = React.useState<boolean>(false)

  const [slippTolerance, setSlippTolerance] = React.useState<string>(initialSlippage)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const [minimumSliderIndex, setMinimumSliderIndex] = useState<number>(0)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)

  const [shouldReversePlot, setShouldReversePlot] = useState(false)

  const concentrationArray: number[] = useMemo(() => {
    const validatedMidPrice = validConcentrationMidPriceTick(midPrice.index, isXtoY, tickSpacing)

    const array = getConcentrationArray(tickSpacing, 2, validatedMidPrice).sort((a, b) => a - b)
    const maxConcentrationArray = [...array, calculateConcentration(0, tickSpacing)]

    return maxConcentrationArray
  }, [tickSpacing, midPrice.index])

  const [concentrationIndex, setConcentrationIndex] = useState(
    getConcentrationIndex(
      concentrationArray,
      +initialConcentration < 2 ? 2 : initialConcentration ? +initialConcentration : 34
    )
  )

  const bestFeeIndex = useMemo(() => {
    const feeTiersTVLValues = Object.values(feeTiersWithTvl)
    const bestFee = feeTiersTVLValues.length > 0 ? Math.max(...feeTiersTVLValues) : 0
    const bestTierIndex = ALL_FEE_TIERS_DATA.findIndex(tier => {
      return feeTiersWithTvl[+printBN(tier.tier.fee, DECIMAL - 2)] === bestFee && bestFee > 0
    })
    return bestTierIndex
  }, [ALL_FEE_TIERS_DATA, feeTiersWithTvl])

  const rangeConcentrationArray = useMemo(() => {
    const leftMinTick = isXtoY ? getMinTick(tickSpacing) : getMaxTick(tickSpacing)
    const rightMaxTick = isXtoY ? getMaxTick(tickSpacing) : getMinTick(tickSpacing)

    const maxConcForRange = calculateConcentration(0, tickSpacing)
    const minConcForRange = calculateConcentration(leftMinTick, rightMaxTick)
    const rangeConcentration = [...concentrationArray]
    rangeConcentration.unshift(minConcForRange)
    rangeConcentration.push(maxConcForRange)

    return rangeConcentration
  }, [concentrationArray, tickSpacing])

  const concentrationIndexForRange = useMemo(() => {
    const index = rangeConcentrationArray.findIndex(value => {
      return (
        Math.floor(value) >= Math.floor(+calculateConcentration(leftRange, rightRange).toFixed(2))
      )
    })
    return index !== -1 ? index : 0
  }, [rangeConcentrationArray, leftRange, rightRange, positionOpeningMethod])

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
  const isDepositEmptyOrZero = (val: string) => val === '' || +val === 0

  const isAutoswapOn = useMemo(
    () =>
      isAutoSwapAvailable && (tokenACheckbox || tokenBCheckbox) && alignment == DepositOptions.Auto,
    [isAutoSwapAvailable, tokenACheckbox, tokenBCheckbox, alignment]
  )

  useEffect(() => {
    if (isAutoSwapAvailable) {
      setAlignment(DepositOptions.Auto)
    } else if (!isAutoSwapAvailable && alignment === DepositOptions.Auto) {
      setAlignment(DepositOptions.Basic)
    }
  }, [isAutoSwapAvailable])

  const isAutoSwapOnTheSamePool = useMemo(
    () =>
      poolAddress.length > 0 &&
      autoSwapPools.some(item => item.swapPool.address.toString() === poolAddress),
    [poolAddress]
  )

  const setRangeBlockerInfo = () => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return 'Select tokens to set price range.'
    }

    if (tokenAIndex === tokenBIndex) {
      return "Token A can't be the same as token B"
    }

    if (isWaitingForNewPool) {
      return 'Loading pool info...'
    }

    return ''
  }

  const noRangePlaceholderProps = {
    data: Array(100)
      .fill(1)
      .map((_e, index) => ({ x: index, y: index, index })),
    midPrice: {
      x: 50,
      index: 0
    },
    tokenASymbol: 'ABC',
    tokenBSymbol: 'XYZ'
  }

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

  const estimatedScalePoints = useMemo(() => {
    return estimatedPointsForScale(
      positionOpeningMethod === 'concentration'
        ? (concentrationArray[concentrationIndex] ??
            concentrationArray[concentrationArray.length - 1])
        : calculateConcentration(leftRange, rightRange),
      positionOpeningMethod === 'concentration' ? concentrationArray : rangeConcentrationArray
    )
  }, [estimatedPointsPerDay, tokenADeposit, tokenBDeposit, positionOpeningMethod])

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
    let leftRange: number
    let rightRange: number

    if (positionOpeningMethod === 'range') {
      const { leftInRange, rightInRange } = getTicksInsideRange(left, right, isXtoY)
      leftRange = leftInRange
      rightRange = rightInRange
    } else {
      leftRange = left
      rightRange = right
    }

    setLeftRange(leftRange)
    setRightRange(rightRange)
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

  const onChangeMidPrice = (tickIndex: number, sqrtPrice: BN) => {
    setMidPrice({
      index: tickIndex,
      x: calcPriceByTickIndex(tickIndex, isXtoY, xDecimal, yDecimal),
      sqrtPrice: sqrtPrice
    })

    if (tokenAIndex !== null && (isXtoY ? rightRange > tickIndex : rightRange < tickIndex)) {
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
    }
    if (tokenBIndex !== null && (isXtoY ? leftRange < tickIndex : leftRange > tickIndex)) {
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

  const promotedPoolTierIndex =
    tokenAIndex === null || tokenBIndex === null
      ? undefined
      : (promotedTiers.find(
          tier =>
            (tier.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (tier.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenAIndex].assetAddress))
        )?.index ?? undefined)

  const getMinSliderIndex = () => {
    let minimumSliderIndex = 0

    for (let index = 0; index < concentrationArray.length; index++) {
      const value = concentrationArray[index]

      const { leftRange, rightRange } = calculateConcentrationRange(
        tickSpacing,
        value,
        2,
        midPrice.index,
        isXtoY
      )

      const { leftInRange, rightInRange } = getTicksInsideRange(leftRange, rightRange, isXtoY)

      if (leftInRange !== leftRange || rightInRange !== rightRange) {
        minimumSliderIndex = index + 1
      } else {
        break
      }
    }

    return minimumSliderIndex
  }

  useEffect(() => {
    if (positionOpeningMethod === 'concentration') {
      const minimumSliderIndex = getMinSliderIndex()

      setMinimumSliderIndex(minimumSliderIndex)
    }
  }, [poolIndex, positionOpeningMethod, midPrice.index])

  useEffect(() => {
    if (positionOpeningMethod === 'range') {
      onChangeRange(leftRange, rightRange)
    }
  }, [midPrice.index, leftRange, rightRange, currentPriceSqrt.toString()])

  const handleClickSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setSettings(true)
  }

  const handleCloseSettings = () => {
    unblurContent()
    setSettings(false)
  }

  const handleClickFAQ = () => {
    blurContent()
    setIsFAQModalOpen(true)
  }

  const handleCloseFAQ = () => {
    unblurContent()
    setIsFAQModalOpen(false)
  }

  const setSlippage = (slippage: string): void => {
    setSlippTolerance(slippage)
    onSlippageChange(slippage)
  }

  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  const updatePath = (
    index1: number | null,
    index2: number | null,
    fee: number,
    concentration?: number,
    isRange?: boolean
  ) => {
    if (canNavigate) {
      const parsedFee = parseFeeToPathFee(+ALL_FEE_TIERS_DATA[fee].tier.fee)

      clearTimeout(urlUpdateTimeoutRef.current)

      if (index1 != null && index2 != null) {
        const token1Symbol = addressToTicker(network, tokens[index1].assetAddress.toString())
        const token2Symbol = addressToTicker(network, tokens[index2].assetAddress.toString())

        const mappedIndex = getConcentrationIndex(concentrationArray, concentration)

        const validIndex = Math.max(
          minimumSliderIndex,
          Math.min(mappedIndex, concentrationArray.length - 1)
        )

        const concParam = concentration ? `?conc=${concentrationArray[validIndex].toFixed(0)}` : ''
        const rangeParam =
          isRange === undefined
            ? initialOpeningPositionMethod === 'range'
              ? '&range=true'
              : '&range=false'
            : isRange
              ? '&range=true'
              : '&range=false'

        urlUpdateTimeoutRef.current = setTimeout(() => {
          navigate(
            ROUTES.getNewPositionRoute(
              token1Symbol,
              token2Symbol,
              parsedFee + concParam + rangeParam
            ),
            {
              replace: true
            }
          )
        }, 500)
      } else if (index1 != null) {
        const tokenSymbol = addressToTicker(network, tokens[index1].assetAddress.toString())
        urlUpdateTimeoutRef.current = setTimeout(() => {
          navigate(ROUTES.getNewPositionRoute(tokenSymbol, parsedFee), { replace: true })
        }, 500)
      } else if (index2 != null) {
        const tokenSymbol = addressToTicker(network, tokens[index2].assetAddress.toString())
        urlUpdateTimeoutRef.current = setTimeout(() => {
          navigate(ROUTES.getNewPositionRoute(tokenSymbol, parsedFee), { replace: true })
        }, 500)
      } else if (fee != null) {
        urlUpdateTimeoutRef.current = setTimeout(() => {
          navigate(ROUTES.getNewPositionRoute(parsedFee), { replace: true })
        }, 500)
      }
    }
  }

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
      positionOpeningMethod === 'range'
        ? determinePositionTokenBlock(
            currentPriceSqrt,
            Math.min(leftRange, rightRange),
            Math.max(leftRange, rightRange),
            isXtoY
          )
        : false,
    [leftRange, rightRange, currentPriceSqrt]
  )

  const networkUrl = useMemo(() => {
    switch (network) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return '?cluster=testnet'
    }
  }, [network])

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

  const [wasRefreshed, setWasRefreshed] = useState(false)

  useEffect(() => {
    if (isWaitingForNewPool) {
      setWasRefreshed(true)
    }
  }, [isWaitingForNewPool])

  const usdcPrice = useMemo(() => {
    if (tokenAIndex === null || tokenBIndex === null) return null

    const revertDenominator = initialXtoY(
      tokens[tokenAIndex].assetAddress.toString(),
      tokens[tokenBIndex].assetAddress.toString()
    )

    if (
      tokens[tokenAIndex].assetAddress.equals(USDC_MAIN.address) ||
      tokens[tokenBIndex].assetAddress.equals(USDC_MAIN.address) ||
      tokens[tokenAIndex].assetAddress.equals(USDT_MAIN.address) ||
      tokens[tokenBIndex].assetAddress.equals(USDT_MAIN.address)
    ) {
      return null
    }

    const shouldDisplayPrice =
      ADDRESSES_TO_REVERT_TOKEN_PAIRS.includes(tokens[tokenAIndex].assetAddress.toString()) ||
      ADDRESSES_TO_REVERT_TOKEN_PAIRS.includes(tokens[tokenBIndex].assetAddress.toString())

    if (!shouldDisplayPrice) {
      return null
    }

    const ratioToDenominator = revertDenominator ? midPrice.x : 1 / midPrice.x
    const denominatorPrice = revertDenominator ? tokenBPriceData?.price : tokenAPriceData?.price

    if (!denominatorPrice) {
      return null
    }

    return {
      token: revertDenominator ? tokens[tokenAIndex].symbol : tokens[tokenBIndex].symbol,
      price: ratioToDenominator * denominatorPrice
    }
  }, [midPrice.x, priceALoading, priceBLoading])

  return (
    <Grid container className={classes.wrapper}>
      <Grid onClick={() => handleBack()} className={classes.back} container item>
        <img className={classes.backIcon} src={backIcon} alt='back' />
        <Typography className={classes.backText}>Back</Typography>
      </Grid>

      <Grid container className={classes.headerContainer}>
        <Box className={classes.titleContainer}>
          <Typography className={classes.title}>Add new position</Typography>

          {isMd && (
            <Fade in={isPromotedPool} timeout={250}>
              <div>
                <PointsLabel
                  handleClickFAQ={handleClickFAQ}
                  concentrationArray={
                    positionOpeningMethod === 'concentration'
                      ? concentrationArray
                      : rangeConcentrationArray
                  }
                  concentrationIndex={
                    positionOpeningMethod === 'concentration'
                      ? concentrationIndex
                      : concentrationIndexForRange
                  }
                  estimatedPointsPerDay={estimatedPointsPerDay}
                  estimatedScalePoints={estimatedScalePoints}
                  isConnected={walletStatus === Status.Init}
                  showWarning={
                    (isAutoswapOn &&
                      isDepositEmptyOrZero(tokenADeposit) &&
                      isDepositEmptyOrZero(tokenBDeposit)) ||
                    (!isAutoswapOn &&
                      (isDepositEmptyOrZero(tokenADeposit) ||
                        isDepositEmptyOrZero(tokenBDeposit))) ||
                    (!tokenACheckbox && isDepositEmptyOrZero(tokenBDeposit)) ||
                    (!tokenBCheckbox && isDepositEmptyOrZero(tokenADeposit)) ||
                    (!tokenACheckbox && !tokenBCheckbox)
                  }
                  singleDepositWarning={
                    tokenAIndex !== null &&
                    tokenBIndex !== null &&
                    !isWaitingForNewPool &&
                    !!blockedToken
                  }
                  positionOpeningMethod={positionOpeningMethod}
                />
              </div>
            </Fade>
          )}
          {tokenAIndex !== tokenBIndex && !isMd && (
            <TooltipHover title='Refresh' right={8}>
              {isCurrentPoolExisting ? (
                <Box
                  mr={1}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  width={26}
                  height={21}>
                  <Refresher
                    currentIndex={refresherTime}
                    maxIndex={REFRESHER_INTERVAL}
                    onClick={() => {
                      onRefresh()
                      setRefresherTime(REFRESHER_INTERVAL)
                    }}
                  />
                </Box>
              ) : (
                <MuiButton onClick={onRefresh} className={classes.refreshIconBtn}>
                  <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                </MuiButton>
              )}
            </TooltipHover>
          )}
        </Box>
        {tokenAIndex !== null && tokenBIndex !== null && (
          <Grid container item className={classes.options}>
            {poolIndex !== null && poolAddress ? (
              <>
                <MarketIdLabel
                  displayLength={4}
                  marketId={poolAddress}
                  copyPoolAddressHandler={copyPoolAddressHandler}
                />
                <TooltipHover title='Open pool in explorer'>
                  <Grid width={'12px'} height={'24px'}>
                    <a
                      href={`https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={event => {
                        event.stopPropagation()
                      }}
                      className={classes.link}>
                      <img width={8} height={8} src={newTabIcon} alt={'Token address'} />
                    </a>
                  </Grid>
                </TooltipHover>
              </>
            ) : null}
            <Grid className={classes.optionsWrapper}>
              <Hidden mdDown>
                {tokenAIndex !== null && tokenBIndex !== null && (
                  <ConcentrationTypeSwitch
                    onSwitch={val => {
                      if (val) {
                        setPositionOpeningMethod('concentration')
                        onPositionOpeningMethodChange('concentration')
                        updatePath(
                          tokenAIndex,
                          tokenBIndex,
                          currentFeeIndex,
                          +concentrationArray[concentrationIndex].toFixed(0),
                          false
                        )
                      } else {
                        setPositionOpeningMethod('range')
                        onPositionOpeningMethodChange('range')

                        updatePath(
                          tokenAIndex,
                          tokenBIndex,
                          currentFeeIndex,
                          +concentrationArray[concentrationIndex].toFixed(0),
                          true
                        )
                      }
                    }}
                    className={classes.switch}
                    currentValue={positionOpeningMethod === 'concentration' ? 0 : 1}
                  />
                )}
              </Hidden>
              {tokenAIndex !== tokenBIndex && isMd && (
                <TooltipHover title='Refresh'>
                  {isCurrentPoolExisting ? (
                    <Box>
                      <Refresher
                        currentIndex={refresherTime}
                        maxIndex={REFRESHER_INTERVAL}
                        onClick={() => {
                          onRefresh()
                          setRefresherTime(REFRESHER_INTERVAL)
                        }}
                      />
                    </Box>
                  ) : (
                    <MuiButton onClick={onRefresh} className={classes.refreshIconBtn}>
                      <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                    </MuiButton>
                  )}
                </TooltipHover>
              )}
              {poolIndex !== null && (
                <TooltipHover title='Settings'>
                  <Button
                    onClick={handleClickSettings}
                    className={classes.settingsIconBtn}
                    disableRipple>
                    <img src={settingIcon} className={classes.settingsIcon} alt='settings' />
                  </Button>
                </TooltipHover>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>

      {
        <Slippage
          open={settings}
          setSlippage={setSlippage}
          handleClose={handleCloseSettings}
          anchorEl={anchorEl}
          initialSlippage={initialSlippage}
          infoText='Slippage tolerance is a pricing difference between the price at the confirmation time and the actual price of the transaction users are willing to accept when initializing position.'
          headerText='Position Settings'
        />
      }

      <Grid container className={classes.row}>
        <DepositSelector
          tokenAIndex={tokenAIndex}
          tokenBIndex={tokenBIndex}
          setTokenAIndex={setTokenAIndex}
          setTokenBIndex={setTokenBIndex}
          initialTokenFrom={initialTokenFrom}
          initialTokenTo={initialTokenTo}
          initialFee={initialFee}
          className={classes.deposit}
          tokens={tokens}
          setPositionTokens={(index1, index2, fee) => {
            setTokenAIndex(index1)
            setTokenBIndex(index2)
            onChangePositionTokens(index1, index2, fee)

            if (!isLoadingTokens) {
              updatePath(index1, index2, fee, +concentrationArray[concentrationIndex].toFixed(0)),
                positionOpeningMethod === 'range'
            }
          }}
          onAddLiquidity={() => {
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
          }}
          onSwapAndAddLiquidity={(
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
              minUtilizationPercentage,
              leftRange,
              rightRange
            )
          }}
          tokenAInputState={{
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
                !isWaitingForNewPool &&
                blockedToken === PositionTokenBlock.A &&
                alignment === DepositOptions.Basic) ||
              !tokenACheckbox,

            blockerInfo:
              alignment === DepositOptions.Basic
                ? 'Range only for single-asset deposit'
                : 'You chose not to spend this token',
            decimalsLimit: tokenAIndex !== null ? tokens[tokenAIndex].decimals : 0
          }}
          tokenBInputState={{
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
                !isWaitingForNewPool &&
                blockedToken === PositionTokenBlock.B &&
                alignment === DepositOptions.Basic) ||
              !tokenBCheckbox,
            blockerInfo:
              alignment === DepositOptions.Basic
                ? 'Range only for single-asset deposit'
                : 'You chose not to spend this token',
            decimalsLimit: tokenBIndex !== null ? tokens[tokenBIndex].decimals : 0
          }}
          feeTiers={feeTiers.map(tier => tier.feeValue)}
          progress={progress as ProgressState}
          onReverseTokens={() => {
            if (tokenAIndex === null || tokenBIndex === null) {
              return
            }
            setShouldReversePlot(true)
            const pom = tokenAIndex
            setTokenAIndex(tokenBIndex)
            setTokenBIndex(pom)
            onChangePositionTokens(tokenBIndex, tokenAIndex, currentFeeIndex)

            if (!isLoadingTokens) {
              updatePath(
                tokenBIndex,
                tokenAIndex,
                currentFeeIndex,
                +concentrationArray[concentrationIndex].toFixed(0),
                positionOpeningMethod === 'range'
              )
            }
          }}
          poolIndex={poolIndex}
          handleAddToken={handleAddToken}
          commonTokens={commonTokens}
          initialHideUnknownTokensValue={initialHideUnknownTokensValue}
          onHideUnknownTokensChange={onHideUnknownTokensChange}
          priceA={tokenAPriceData?.price}
          priceB={tokenBPriceData?.price}
          priceALoading={priceALoading}
          priceBLoading={priceBLoading}
          feeTierIndex={currentFeeIndex}
          concentrationArray={concentrationArray}
          concentrationIndex={concentrationIndex}
          minimumSliderIndex={minimumSliderIndex}
          positionOpeningMethod={positionOpeningMethod}
          isBalanceLoading={isBalanceLoading}
          isGetLiquidityError={isGetLiquidityError}
          isLoadingTicksOrTickmap={isLoadingTicksOrTickmap}
          network={network}
          ethBalance={ethBalance}
          walletStatus={walletStatus}
          onConnectWallet={onConnectWallet}
          onDisconnectWallet={onDisconnectWallet}
          canNavigate={canNavigate}
          isCurrentPoolExisting={isCurrentPoolExisting}
          promotedPoolTierIndex={promotedPoolTierIndex}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
          isLoadingStats={isLoadingStats}
          isAutoSwapAvailable={isAutoSwapAvailable}
          isAutoSwapOnTheSamePool={isAutoSwapOnTheSamePool}
          autoSwapPoolData={autoSwapPoolData}
          autoSwapTickmap={autoSwapTickmap}
          autoSwapTicks={autoSwapTicks}
          simulationParams={simulationParams}
          initialMaxPriceImpact={initialMaxPriceImpact}
          onMaxPriceImpactChange={onMaxPriceImpactChange}
          initialMinUtilization={initialMinUtilization}
          onMinUtilizationChange={onMinUtilizationChange}
          onMaxSlippageToleranceSwapChange={onMaxSlippageToleranceSwapChange}
          initialMaxSlippageToleranceSwap={initialMaxSlippageToleranceSwap}
          onMaxSlippageToleranceCreatePositionChange={onMaxSlippageToleranceCreatePositionChange}
          initialMaxSlippageToleranceCreatePosition={initialMaxSlippageToleranceCreatePosition}
          tokenACheckbox={tokenACheckbox}
          setTokenACheckbox={setTokenACheckbox}
          tokenBCheckbox={tokenBCheckbox}
          setTokenBCheckbox={setTokenBCheckbox}
          alignment={alignment}
          setAlignment={setAlignment}
          updateLiquidity={updateLiquidity}
        />
        <Hidden mdUp>
          <Grid container alignSelf='flex-end' mb={2} width='200px'>
            {tokenAIndex !== null && tokenBIndex !== null && (
              <ConcentrationTypeSwitch
                onSwitch={val => {
                  if (val) {
                    setPositionOpeningMethod('concentration')
                    onPositionOpeningMethodChange('concentration')
                  } else {
                    setPositionOpeningMethod('range')
                    onPositionOpeningMethodChange('range')
                  }
                }}
                className={classes.switch}
                currentValue={positionOpeningMethod === 'concentration' ? 0 : 1}
              />
            )}
          </Grid>
        </Hidden>
        {isCurrentPoolExisting ||
        tokenAIndex === null ||
        tokenBIndex === null ||
        tokenAIndex === tokenBIndex ||
        isWaitingForNewPool ? (
          <RangeSelector
            updatePath={(concIndex: number) =>
              updatePath(
                tokenAIndex,
                tokenBIndex,
                currentFeeIndex,
                +concentrationArray[concIndex].toFixed(0),
                positionOpeningMethod === 'range'
              )
            }
            initialConcentration={initialConcentration}
            poolIndex={poolIndex}
            onChangeRange={onChangeRange}
            blocked={
              tokenAIndex === null ||
              tokenBIndex === null ||
              tokenAIndex === tokenBIndex ||
              data.length === 0 ||
              isWaitingForNewPool
            }
            blockerInfo={setRangeBlockerInfo()}
            {...(tokenAIndex === null ||
            tokenBIndex === null ||
            !isCurrentPoolExisting ||
            data.length === 0 ||
            isWaitingForNewPool
              ? noRangePlaceholderProps
              : {
                  data,
                  midPrice,
                  tokenASymbol: tokens[tokenAIndex].symbol,
                  tokenBSymbol: tokens[tokenBIndex].symbol
                })}
            isLoadingTicksOrTickmap={isLoadingTicksOrTickmap}
            isXtoY={isXtoY}
            tickSpacing={tickSpacing}
            xDecimal={xDecimal}
            yDecimal={yDecimal}
            currentPairReversed={currentPairReversed}
            positionOpeningMethod={positionOpeningMethod}
            hasTicksError={hasTicksError}
            reloadHandler={reloadHandler}
            concentrationArray={concentrationArray}
            setConcentrationIndex={setConcentrationIndex}
            concentrationIndex={concentrationIndex}
            minimumSliderIndex={minimumSliderIndex}
            getTicksInsideRange={getTicksInsideRange}
            shouldReversePlot={shouldReversePlot}
            setShouldReversePlot={setShouldReversePlot}
            shouldNotUpdatePriceRange={shouldNotUpdatePriceRange}
            unblockUpdatePriceRange={unblockUpdatePriceRange}
            onlyUserPositions={onlyUserPositions}
            setOnlyUserPositions={setOnlyUserPositions}
            usdcPrice={usdcPrice}
            suggestedPrice={suggestedPrice}
            oraclePrice={oraclePrice}
            currentFeeIndex={currentFeeIndex}
            bestFeeIndex={bestFeeIndex}
          />
        ) : (
          <PoolInit
            onChangeRange={onChangeRange}
            isXtoY={isXtoY}
            tickSpacing={tickSpacing}
            xDecimal={xDecimal}
            yDecimal={yDecimal}
            tokenASymbol={tokenAIndex !== null ? tokens[tokenAIndex].symbol : 'ABC'}
            tokenBSymbol={tokenBIndex !== null ? tokens[tokenBIndex].symbol : 'XYZ'}
            midPriceIndex={midPrice.index}
            midPriceSqrtPrice={midPrice.sqrtPrice}
            onChangeMidPrice={onChangeMidPrice}
            currentPairReversed={currentPairReversed}
            positionOpeningMethod={positionOpeningMethod}
            concentrationArray={concentrationArray}
            concentrationIndex={concentrationIndex}
            setConcentrationIndex={setConcentrationIndex}
            minimumSliderIndex={minimumSliderIndex}
            initialConcentration={initialConcentration}
            updatePath={(concIndex: number) =>
              updatePath(
                tokenAIndex,
                tokenBIndex,
                currentFeeIndex,
                +concentrationArray[concIndex].toFixed(0),
                positionOpeningMethod === 'range'
              )
            }
            currentFeeIndex={currentFeeIndex}
            suggestedPrice={suggestedPrice}
            wasRefreshed={wasRefreshed}
            setWasRefreshed={setWasRefreshed}
            bestFeeIndex={bestFeeIndex}
          />
        )}
      </Grid>

      <Fade
        in={isPromotedPool}
        timeout={250}
        style={{ width: '100%' }}
        unmountOnExit={isMd}
        mountOnEnter={isMd}>
        <div>
          <EstimatedPoints
            handleClickFAQ={handleClickFAQ}
            concentrationArray={
              positionOpeningMethod === 'concentration'
                ? concentrationArray
                : rangeConcentrationArray
            }
            concentrationIndex={
              positionOpeningMethod === 'concentration'
                ? concentrationIndex
                : concentrationIndexForRange
            }
            estimatedPointsPerDay={estimatedPointsPerDay}
            estimatedScalePoints={estimatedScalePoints}
            isConnected={walletStatus === Status.Init}
            showWarning={
              (isAutoswapOn &&
                isDepositEmptyOrZero(tokenADeposit) &&
                isDepositEmptyOrZero(tokenBDeposit)) ||
              (!isAutoswapOn &&
                (isDepositEmptyOrZero(tokenADeposit) || isDepositEmptyOrZero(tokenBDeposit))) ||
              (!tokenACheckbox && isDepositEmptyOrZero(tokenBDeposit)) ||
              (!tokenBCheckbox && isDepositEmptyOrZero(tokenADeposit)) ||
              (!tokenACheckbox && !tokenBCheckbox)
            }
            singleDepositWarning={
              tokenAIndex !== null && tokenBIndex !== null && !isWaitingForNewPool && !!blockedToken
            }
            positionOpeningMethod={positionOpeningMethod}
          />
        </div>
      </Fade>

      <FAQModal handleClose={handleCloseFAQ} open={isFAQModalOpen} />
    </Grid>
  )
}

export default NewPosition
