import { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@components/Refresher/Refresher'
import { Box, Button, Fade, Grid, Hidden, Typography, useMediaQuery } from '@mui/material'
import backIcon from '@static/svg/back-arrow.svg'
import settingIcon from '@static/svg/settings.svg'
import {
  ALL_FEE_TIERS_DATA,
  NetworkType,
  PositionTokenBlock,
  promotedTiers,
  REFRESHER_INTERVAL
} from '@store/consts/static'
import {
  addressToTicker,
  calcPriceByTickIndex,
  calculateConcentration,
  calculateConcentrationRange,
  convertBalanceToBN,
  determinePositionTokenBlock,
  getConcentrationIndex,
  nearestTicksBySpacing,
  parseFeeToPathFee,
  printBN,
  trimLeadingZeros,
  validConcentrationMidPriceTick
} from '@utils/utils'
import { PlotTickData } from '@store/reducers/positions'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { VariantType } from 'notistack'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConcentrationTypeSwitch from './ConcentrationTypeSwitch/ConcentrationTypeSwitch'
import DepositSelector from './DepositSelector/DepositSelector'
import MarketIdLabel from './MarketIdLabel/MarketIdLabel'
import PoolInit from './PoolInit/PoolInit'
import RangeSelector from './RangeSelector/RangeSelector'
import useStyles from './style'
import {
  BestTier,
  PositionOpeningMethod,
  PotentialLiquidity,
  TokenPriceData
} from '@store/consts/types'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { InitMidPrice } from '@components/PriceRangePlot/PriceRangePlot'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  fromFee,
  getConcentrationArray,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import icons from '@static/icons'
import FAQModal from '@components/Modals/FAQModal/FAQModal'
import EstimatedPoints from './EstimatedPoints/EstimatedPoints'
import { theme } from '@static/theme'
import PointsLabel from './EstimatedPoints/PointsLabel'

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
    xAmount: number,
    yAmount: number,
    slippage: BN
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
    tokenAddress: PublicKey,
    calcPotentialLiquidity?: PotentialLiquidity
  ) => BN
  feeTiers: Array<{
    feeValue: number
  }>
  ticksLoading: boolean
  loadingTicksAndTickMaps: boolean
  progress: ProgressState
  isXtoY: boolean
  xDecimal: number
  yDecimal: number
  tickSpacing: number
  isWaitingForNewPool: boolean
  poolIndex: number | null
  currentPairReversed: boolean | null
  bestTiers: BestTier[]
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
  estimatedPointsForScale: (conc: number) => { min: BN; middle: BN; max: BN }
  isPromotedPool: boolean
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
  feeTiers,
  ticksLoading,
  isXtoY,
  xDecimal,
  yDecimal,
  tickSpacing,
  isWaitingForNewPool,
  poolIndex,
  currentPairReversed,
  bestTiers,
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
  isPromotedPool
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const [positionOpeningMethod, setPositionOpeningMethod] = useState<PositionOpeningMethod>(
    initialOpeningPositionMethod
  )

  const [leftRange, setLeftRange] = useState(getMinTick(tickSpacing))
  const [rightRange, setRightRange] = useState(getMaxTick(tickSpacing))

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [settings, setSettings] = React.useState<boolean>(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = React.useState<boolean>(false)

  const [slippTolerance, setSlippTolerance] = React.useState<string>(initialSlippage)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const [minimumSliderIndex, setMinimumSliderIndex] = useState<number>(0)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)

  const [shouldReversePlot, setShouldReversePlot] = useState(false)

  const concentrationArray = useMemo(() => {
    const validatedMidPrice = validConcentrationMidPriceTick(midPrice.index, isXtoY, tickSpacing)

    return getConcentrationArray(tickSpacing, 2, validatedMidPrice).sort((a, b) => a - b)
  }, [tickSpacing, midPrice.index])

  const [concentrationIndex, setConcentrationIndex] = useState(
    getConcentrationIndex(concentrationArray, initialConcentration ? +initialConcentration : 34)
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

  const getTokenAmountForPotentialPoints = (amount: BN, byFirst: boolean) => {
    const printIndex = byFirst ? tokenBIndex : tokenAIndex
    const calcIndex = byFirst ? tokenAIndex : tokenBIndex
    if (printIndex === null || calcIndex === null) {
      return '0.0'
    }
    const minTick = isXtoY ? getMinTick(tickSpacing) : getMaxTick(tickSpacing)
    const maxTick = isXtoY ? getMaxTick(tickSpacing) : getMinTick(tickSpacing)

    const { leftRange: leftRangeMin, rightRange: rightRangeMin } = calculateConcentrationRange(
      tickSpacing,
      concentrationArray[0],
      2,
      midPrice.index,
      isXtoY
    )

    const { leftRange: leftRangeMiddle, rightRange: rightRangeMiddle } =
      calculateConcentrationRange(
        tickSpacing,
        +concentrationArray[Math.floor(concentrationArray.length / 2) - 1].toFixed(0),
        2,
        midPrice.index,
        isXtoY
      )

    const { leftRange: leftRangeMax, rightRange: rightRangeMax } = calculateConcentrationRange(
      tickSpacing,
      +concentrationArray[concentrationArray.length - 1].toFixed(0),
      2,
      midPrice.index,
      isXtoY
    )

    calcAmount(
      amount,
      positionOpeningMethod === 'concentration' ? leftRangeMin : minTick,
      positionOpeningMethod === 'concentration' ? rightRangeMin : maxTick,
      tokens[calcIndex].assetAddress,
      PotentialLiquidity.Min
    )
    calcAmount(
      amount,
      leftRangeMiddle,
      rightRangeMiddle,
      tokens[calcIndex].assetAddress,
      PotentialLiquidity.Middle
    )

    const { lowerTick: nearestLowerTick, upperTick: nearestUpperTick } = nearestTicksBySpacing(
      midPrice.index,
      tickSpacing,
      isXtoY
    )

    calcAmount(
      amount,
      positionOpeningMethod === 'concentration' ? leftRangeMax : nearestLowerTick,
      positionOpeningMethod === 'concentration' ? rightRangeMax : nearestUpperTick,
      tokens[calcIndex].assetAddress,

      PotentialLiquidity.Max
    )
  }

  const getOtherTokenAmount = (amount: BN, left: number, right: number, byFirst: boolean) => {
    getTokenAmountForPotentialPoints(amount, byFirst)
    const printIndex = byFirst ? tokenBIndex : tokenAIndex
    const calcIndex = byFirst ? tokenAIndex : tokenBIndex
    if (printIndex === null || calcIndex === null) {
      return '0.0'
    }

    const result = calcAmount(amount, left, right, tokens[calcIndex].assetAddress)

    return trimLeadingZeros(printBN(result, tokens[printIndex].decimals))
  }

  const estimatedScalePoints = useMemo(() => {
    return estimatedPointsForScale(
      positionOpeningMethod === 'concentration'
        ? concentrationArray[concentrationIndex]
        : calculateConcentration(leftRange, rightRange)
    )
  }, [estimatedPointsPerDay, concentrationIndex])

  const getTicksInsideRange = (left: number, right: number, isXtoY: boolean) => {
    const leftMax = isXtoY ? getMinTick(tickSpacing) : getMaxTick(tickSpacing)
    const rightMax = isXtoY ? getMaxTick(tickSpacing) : getMinTick(tickSpacing)

    let leftInRange
    let rightInRange

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
      tokenBIndex !== null &&
      (isXtoY ? rightRange < midPrice.index : rightRange > midPrice.index)
    ) {
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
    } else if (
      tokenAIndex !== null &&
      ((isXtoY ? leftRange > midPrice.index : leftRange < midPrice.index) ||
        (isXtoY ? rightRange > midPrice.index : rightRange < midPrice.index))
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
    }
    if (tokenBIndex !== null && (isXtoY ? leftRange < tickIndex : leftRange > tickIndex)) {
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

  const bestTierIndex =
    tokenAIndex === null || tokenBIndex === null
      ? undefined
      : (bestTiers.find(
          tier =>
            (tier.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (tier.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenAIndex].assetAddress))
        )?.bestTierIndex ?? undefined)

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
    if (!ticksLoading && positionOpeningMethod === 'range') {
      onChangeRange(leftRange, rightRange)
    }
  }, [midPrice.index, leftRange, rightRange])

  useEffect(() => {
    if (positionOpeningMethod === 'range') {
      onChangeRange(leftRange, rightRange)
    }
  }, [currentPriceSqrt])

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

  const updatePath = (
    index1: number | null,
    index2: number | null,
    fee: number,
    concentration?: number,
    isRange?: boolean
  ) => {
    if (canNavigate) {
      const parsedFee = parseFeeToPathFee(+ALL_FEE_TIERS_DATA[fee].tier.fee)

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

        navigate(
          `/newPosition/${token1Symbol}/${token2Symbol}/${parsedFee}${concParam}${rangeParam}`,
          {
            replace: true
          }
        )
      } else if (index1 != null) {
        const tokenSymbol = addressToTicker(network, tokens[index1].assetAddress.toString())
        navigate(`/newPosition/${tokenSymbol}/${parsedFee}`, { replace: true })
      } else if (index2 != null) {
        const tokenSymbol = addressToTicker(network, tokens[index2].assetAddress.toString())
        navigate(`/newPosition/${tokenSymbol}/${parsedFee}`, { replace: true })
      } else if (fee != null) {
        navigate(`/newPosition/${parsedFee}`, { replace: true })
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

  return (
    <Grid container className={classes.wrapper} direction='column'>
      <Link to='/portfolio' style={{ textDecoration: 'none', maxWidth: 'fit-content' }}>
        <Grid className={classes.back} container item alignItems='center'>
          <img className={classes.backIcon} src={backIcon} alt='back' />
          <Typography className={classes.backText}>Positions</Typography>
        </Grid>
      </Link>

      <Grid
        container
        justifyContent='space-between'
        alignItems='center'
        className={classes.headerContainer}
        mb={1}>
        <Box className={classes.titleContainer}>
          <Typography className={classes.title}>Add new position</Typography>

          {isMd && (
            <Fade in={isPromotedPool} timeout={250}>
              <div>
                <PointsLabel
                  handleClickFAQ={handleClickFAQ}
                  concentrationArray={concentrationArray}
                  concentrationIndex={concentrationIndex}
                  estimatedPointsPerDay={estimatedPointsPerDay}
                  estimatedScalePoints={estimatedScalePoints}
                  isConnected={walletStatus === Status.Init}
                  showWarning={
                    tokenADeposit === '' ||
                    tokenBDeposit === '' ||
                    +tokenADeposit === 0 ||
                    +tokenBDeposit === 0
                  }
                  singleDepositWarning={
                    (tokenAIndex !== null &&
                      tokenBIndex !== null &&
                      !isWaitingForNewPool &&
                      blockedToken === PositionTokenBlock.A) ||
                    (tokenAIndex !== null &&
                      tokenBIndex !== null &&
                      !isWaitingForNewPool &&
                      blockedToken === PositionTokenBlock.B)
                  }
                  positionOpeningMethod={positionOpeningMethod}
                  tickSpacing={tickSpacing}
                />
              </div>
            </Fade>
          )}
          {poolIndex !== null && tokenAIndex !== tokenBIndex && !isMd && (
            <TooltipHover text='Refresh'>
              <Box mr={2}>
                <Refresher
                  currentIndex={refresherTime}
                  maxIndex={REFRESHER_INTERVAL}
                  onClick={() => {
                    onRefresh()
                    setRefresherTime(REFRESHER_INTERVAL)
                  }}
                />
              </Box>
            </TooltipHover>
          )}
        </Box>
        {tokenAIndex !== null && tokenBIndex !== null && (
          <Grid container item alignItems='center' className={classes.options}>
            {poolIndex !== null && poolAddress ? (
              <>
                <MarketIdLabel
                  displayLength={4}
                  marketId={poolAddress}
                  copyPoolAddressHandler={copyPoolAddressHandler}
                />
                <TooltipHover text='Open pool in explorer'>
                  <Grid width={'12px'} height={'24px'}>
                    <a
                      href={`https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={event => {
                        event.stopPropagation()
                      }}
                      className={classes.link}>
                      <img width={8} height={8} src={icons.newTab} alt={'Token address'} />
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
              {poolIndex !== null && tokenAIndex !== tokenBIndex && isMd && (
                <TooltipHover text='Refresh'>
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
                </TooltipHover>
              )}
              {poolIndex !== null && (
                <TooltipHover text='Settings'>
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

      <Grid container className={classes.row} alignItems='stretch'>
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
          tokenAInputState={{
            value:
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              !isWaitingForNewPool &&
              blockedToken === PositionTokenBlock.A
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
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              !isWaitingForNewPool &&
              blockedToken === PositionTokenBlock.A,

            blockerInfo: 'Range only for single-asset deposit.',
            decimalsLimit: tokenAIndex !== null ? tokens[tokenAIndex].decimals : 0
          }}
          tokenBInputState={{
            value:
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              !isWaitingForNewPool &&
              blockedToken === PositionTokenBlock.B
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
              tokenAIndex !== null &&
              tokenBIndex !== null &&
              !isWaitingForNewPool &&
              blockedToken === PositionTokenBlock.B,
            blockerInfo: 'Range only for single-asset deposit.',
            decimalsLimit: tokenBIndex !== null ? tokens[tokenBIndex].decimals : 0
          }}
          feeTiers={feeTiers.map(tier => tier.feeValue)}
          progress={progress}
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
          bestTierIndex={bestTierIndex}
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
          ticksLoading={ticksLoading}
          network={network}
          ethBalance={ethBalance}
          walletStatus={walletStatus}
          onConnectWallet={onConnectWallet}
          onDisconnectWallet={onDisconnectWallet}
          canNavigate={canNavigate}
          isCurrentPoolExisting={isCurrentPoolExisting}
          promotedPoolTierIndex={promotedPoolTierIndex}
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
            ticksLoading={ticksLoading}
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
          />
        )}
      </Grid>

      <Fade in={isPromotedPool} timeout={250}>
        <div>
          <EstimatedPoints
            handleClickFAQ={handleClickFAQ}
            concentrationArray={concentrationArray}
            concentrationIndex={concentrationIndex}
            estimatedPointsPerDay={estimatedPointsPerDay}
            estimatedScalePoints={estimatedScalePoints}
            isConnected={walletStatus === Status.Init}
            showWarning={
              tokenADeposit === '' ||
              tokenBDeposit === '' ||
              +tokenADeposit === 0 ||
              +tokenBDeposit === 0
            }
            singleDepositWarning={
              (tokenAIndex !== null &&
                tokenBIndex !== null &&
                !isWaitingForNewPool &&
                blockedToken === PositionTokenBlock.A) ||
              (tokenAIndex !== null &&
                tokenBIndex !== null &&
                !isWaitingForNewPool &&
                blockedToken === PositionTokenBlock.B)
            }
            positionOpeningMethod={positionOpeningMethod}
            tickSpacing={tickSpacing}
          />
        </div>
      </Fade>

      <FAQModal handleClose={handleCloseFAQ} open={isFAQModalOpen} />
    </Grid>
  )
}

export default NewPosition
