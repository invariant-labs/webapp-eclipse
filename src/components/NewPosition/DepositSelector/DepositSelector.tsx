import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import Select from '@components/Inputs/Select/Select'
import {
  Box,
  Button,
  Checkbox,
  Grid,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material'
import {
  ALL_FEE_TIERS_DATA,
  AutoswapCustomError,
  DepositOptions,
  MINIMUM_PRICE_IMPACT,
  NetworkType,
  WETH_POOL_INIT_LAMPORTS_MAIN,
  WETH_POOL_INIT_LAMPORTS_TEST,
  WETH_POSITION_INIT_LAMPORTS_MAIN,
  WETH_POSITION_INIT_LAMPORTS_TEST,
  WETH_SWAP_AND_POSITION_INIT_LAMPORTS_MAIN,
  WETH_SWAP_AND_POSITION_INIT_LAMPORTS_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FeeSwitch from '../FeeSwitch/FeeSwitch'
import { useStyles } from './style'
import { PositionOpeningMethod } from '@store/consts/types'
import { SwapToken } from '@store/selectors/solanaWallet'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { Status } from '@store/reducers/solanaWallet'
import {
  convertBalanceToBN,
  getScaleFromString,
  printBN,
  tickerToAddress,
  parsePathFeeToFeeString,
  trimDecimalZeros,
  simulateAutoSwap,
  simulateAutoSwapOnTheSamePool
} from '@utils/utils'
import { blurContent, createButtonActions, unblurContent } from '@utils/uiUtils'
import { infoIcon, settingIcon, swapListIcon } from '@static/icons'
import { PoolWithAddress } from '@store/reducers/pools'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import {
  DECIMAL,
  SimulateSwapAndCreatePositionSimulation,
  SwapAndCreateSimulationStatus,
  toDecimal
} from '@invariant-labs/sdk-eclipse/lib/utils'
import DepoSitOptionsModal from '@components/Modals/DepositOptionsModal/DepositOptionsModal'
import { theme } from '@static/theme'
import loadingAnimation from '@static/gif/loading.gif'

export interface InputState {
  value: string
  setValue: (value: string) => void
  blocked: boolean
  blockerInfo?: string
  decimalsLimit: number
}

export interface IDepositSelector {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
  tokens: SwapToken[]
  setPositionTokens: (
    tokenAIndex: number | null,
    tokenBindex: number | null,
    feeTierIndex: number
  ) => void
  onAddLiquidity: () => void
  onSwapAndAddLiquidity: (
    xAmount: BN,
    yAmount: BN,
    swapAmount: BN,
    xToY: boolean,
    byAmountIn: boolean,
    estimatedPriceAfterSwap: BN,
    crossedTicks: number[],
    swapSlippage: BN,
    positionSlippage: BN,
    minUtilizationPercentage: BN
  ) => void
  tokenAInputState: InputState
  tokenBInputState: InputState
  feeTiers: number[]
  className?: string
  progress: ProgressState
  priceA?: number
  priceB?: number
  onReverseTokens: () => void
  poolIndex: number | null
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  priceALoading?: boolean
  priceBLoading?: boolean
  feeTierIndex: number
  concentrationArray: number[]
  concentrationIndex: number
  minimumSliderIndex: number
  positionOpeningMethod: PositionOpeningMethod
  isBalanceLoading: boolean
  isGetLiquidityError: boolean
  isLoadingTicksOrTickmap: boolean
  network: NetworkType
  ethBalance: BN
  walletStatus: Status
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  tokenAIndex: number | null
  tokenBIndex: number | null
  setTokenAIndex: (index: number | null) => void
  setTokenBIndex: (index: number | null) => void
  canNavigate: boolean
  isCurrentPoolExisting: boolean
  promotedPoolTierIndex: number | undefined
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  isLoadingStats: boolean
  isAutoSwapAvailable: boolean
  isAutoSwapOnTheSamePool: boolean
  autoSwapPoolData: PoolWithAddress | null
  autoSwapTickmap: Tickmap | null
  autoSwapTicks: Tick[] | null
  simulationParams: {
    lowerTickIndex: number
    upperTickIndex: number
    price: BN
  }
  initialMaxPriceImpact: string
  onMaxPriceImpactChange: (val: string) => void
  initialMinUtilization: string
  onMinUtilizationChange: (val: string) => void
  onMaxSlippageToleranceSwapChange: (val: string) => void
  initialMaxSlippageToleranceSwap: string
  onMaxSlippageToleranceCreatePositionChange: (val: string) => void
  initialMaxSlippageToleranceCreatePosition: string
  tokenACheckbox: boolean
  setTokenACheckbox: (val: boolean) => void
  tokenBCheckbox: boolean
  setTokenBCheckbox: (val: boolean) => void
  alignment: DepositOptions
  setAlignment: (val: DepositOptions) => void
  updateLiquidity: (lq: BN) => void
}

export const DepositSelector: React.FC<IDepositSelector> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  tokens,
  setPositionTokens,
  onAddLiquidity,
  tokenAInputState,
  tokenBInputState,
  feeTiers,
  className,
  progress,
  priceA,
  priceB,
  onReverseTokens,
  poolIndex,
  promotedPoolTierIndex,
  handleAddToken,
  commonTokens,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  priceALoading,
  priceBLoading,
  feeTierIndex,
  concentrationArray,
  concentrationIndex,
  minimumSliderIndex,
  positionOpeningMethod,
  isBalanceLoading,
  isGetLiquidityError,
  isLoadingTicksOrTickmap,
  network,
  walletStatus,
  onConnectWallet,
  onDisconnectWallet,
  ethBalance,
  canNavigate,
  isCurrentPoolExisting,
  feeTiersWithTvl,
  totalTvl,
  isLoadingStats,
  isAutoSwapAvailable,
  autoSwapPoolData,
  autoSwapTickmap,
  autoSwapTicks,
  simulationParams,
  initialMaxPriceImpact,
  onMaxPriceImpactChange,
  initialMinUtilization,
  onMinUtilizationChange,
  isAutoSwapOnTheSamePool,
  onSwapAndAddLiquidity,
  onMaxSlippageToleranceSwapChange,
  initialMaxSlippageToleranceSwap,
  onMaxSlippageToleranceCreatePositionChange,
  initialMaxSlippageToleranceCreatePosition,
  tokenACheckbox,
  setTokenACheckbox,
  tokenBCheckbox,
  setTokenBCheckbox,
  alignment,
  setAlignment,
  updateLiquidity
}) => {
  const { classes, cx } = useStyles()
  const breakpoint630Down = useMediaQuery(theme.breakpoints.down(630))
  const brekpoint1270to1350 = useMediaQuery(theme.breakpoints.between(1270, 1350))
  const breakpointMdTo1000 = useMediaQuery(theme.breakpoints.between('md', 1000))
  const { value: valueA } = tokenAInputState
  const { value: valueB } = tokenBInputState
  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [autoswapCustomError, setAutoswapCustomError] = useState<AutoswapCustomError | null>(null)
  const [utilization, setUtilization] = useState<string>(initialMinUtilization)
  const [slippageToleranceSwap, setSlippageToleranceSwap] = useState<string>(
    initialMaxSlippageToleranceSwap
  )
  const [slippageToleranceCreatePosition, setSlippageToleranceCreatePosition] = useState<string>(
    initialMaxSlippageToleranceCreatePosition
  )

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)
  const [throttle, setThrottle] = useState<boolean>(false)

  const [simulation, setSimulation] = useState<SimulateSwapAndCreatePositionSimulation | null>(null)

  const [settings, setSettings] = useState<boolean>(false)

  const isAutoswapOn = useMemo(() => alignment === DepositOptions.Auto, [alignment])

  const WETH_MIN_FEE_LAMPORTS = useMemo(() => {
    if (network === NetworkType.Testnet) {
      if (isAutoswapOn) {
        return WETH_SWAP_AND_POSITION_INIT_LAMPORTS_TEST
      }
      return isCurrentPoolExisting ? WETH_POSITION_INIT_LAMPORTS_TEST : WETH_POOL_INIT_LAMPORTS_TEST
    } else {
      if (isAutoswapOn) {
        return WETH_SWAP_AND_POSITION_INIT_LAMPORTS_MAIN
      }
      return isCurrentPoolExisting ? WETH_POSITION_INIT_LAMPORTS_MAIN : WETH_POOL_INIT_LAMPORTS_MAIN
    }
  }, [network, isCurrentPoolExisting, alignment])

  const [hideUnknownTokens, setHideUnknownTokens] = useState<boolean>(initialHideUnknownTokensValue)

  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    if (isLoaded || tokens.length === 0 || ALL_FEE_TIERS_DATA.length === 0) {
      return
    }
    let feeTierIndexFromPath = 0
    let tokenAIndexFromPath: null | number = null
    let tokenBIndexFromPath: null | number = null
    const tokenFromAddress = tickerToAddress(network, initialTokenFrom)
    const tokenToAddress = tickerToAddress(network, initialTokenTo)

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
    const parsedFee = parsePathFeeToFeeString(initialFee)

    ALL_FEE_TIERS_DATA.forEach((feeTierData, index) => {
      if (feeTierData.tier.fee.toString() === parsedFee) {
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

  const isPriceImpact = useMemo(
    () =>
      simulation &&
      simulation.swapSimulation &&
      simulation.swapSimulation.priceImpact.gt(toDecimal(+Number(priceImpact).toFixed(4), 2)),
    [simulation, priceImpact]
  )

  useEffect(() => {
    if (canNavigate) {
      const tokenAIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(network, initialTokenFrom)
      )
      if (!wasRunTokenA && tokenAIndex !== -1) {
        setTokenAIndex(tokenAIndex)
        setWasRunTokenA(true)
      }

      const tokenBIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tickerToAddress(network, initialTokenTo)
      )
      if (!wasRunTokenB && tokenBIndex !== -1) {
        setTokenBIndex(tokenBIndex)
        setWasRunTokenB(true)
      }
    }
  }, [wasRunTokenA, wasRunTokenB, canNavigate, tokens.length])

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

    if (positionOpeningMethod === 'concentration' && concentrationIndex < minimumSliderIndex) {
      return concentrationArray[minimumSliderIndex]
        ? `Set concentration to at least ${concentrationArray[minimumSliderIndex].toFixed(0)}x`
        : 'Set higher fee tier'
    }

    if (isGetLiquidityError) {
      return 'Provide a smaller amount'
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

    const tokenABalance = convertBalanceToBN(tokenAInputState.value, tokens[tokenAIndex].decimals)
    const tokenBBalance = convertBalanceToBN(tokenBInputState.value, tokens[tokenBIndex].decimals)

    if (
      (tokens[tokenAIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS &&
        tokens[tokenAIndex].balance.lt(tokenABalance.add(WETH_MIN_FEE_LAMPORTS)) &&
        tokenACheckbox) ||
      (tokens[tokenBIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS &&
        tokens[tokenBIndex].balance.lt(tokenBBalance.add(WETH_MIN_FEE_LAMPORTS)) &&
        tokenBCheckbox) ||
      ethBalance.lt(WETH_MIN_FEE_LAMPORTS)
    ) {
      return `Insufficient ETH`
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

    return 'Add Position'
  }, [
    isAutoSwapAvailable,
    tokenACheckbox,
    tokenBCheckbox,
    tokenAIndex,
    tokenBIndex,
    tokenAInputState,
    tokenBInputState,
    tokens,
    positionOpeningMethod,
    concentrationIndex,
    feeTierIndex,
    minimumSliderIndex,
    isLoadingTicksOrTickmap
  ])

  const handleClickDepositOptions = () => {
    blurContent()
    setSettings(true)
  }

  const handleCloseDepositOptions = () => {
    unblurContent()
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

  const setMaxSlippageToleranceCreatePosition = (slippageToleranceCreatePosition: string): void => {
    setSlippageToleranceCreatePosition(slippageToleranceCreatePosition)
    onMaxSlippageToleranceCreatePositionChange(slippageToleranceCreatePosition)
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

  const reverseTokens = () => {
    if (isLoadingTicksOrTickmap) {
      return
    }

    if (isAutoswapOn) {
      const pom = tokenAInputState.value
      tokenAInputState.setValue(tokenBInputState.value)
      tokenBInputState.setValue(pom)
    } else {
      if (!tokenBInputState.blocked) {
        tokenAInputState.setValue(tokenBInputState.value)
      } else {
        tokenBInputState.setValue(tokenAInputState.value)
      }
    }

    const pom2 = tokenAIndex
    setTokenAIndex(tokenBIndex)
    setTokenBIndex(pom2)
    const pom3 = tokenACheckbox
    setTokenACheckbox(tokenBCheckbox)
    setTokenBCheckbox(pom3)
    onReverseTokens()
  }

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
    minAmount: WETH_MIN_FEE_LAMPORTS,
    onAmountSet: tokenAInputState.setValue
  })
  const actionsTokenB = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_FEE_LAMPORTS,
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
      <>
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
              <span className={classes.autoText}>Auto</span>
              <Tooltip
                title={
                  'AutoSwap allows you to create a position using any token ratio. Simply choose the amount you currently hold in your wallet, and it will be automatically swapped in the most optimal way.'
                }
                classes={{ tooltip: classes.tooltip }}>
                <span className={classes.tooltipIconWrapper}>
                  <img src={infoIcon} alt='' width={'12px'} height={'12px'} />
                </span>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Tooltip
          title={
            !isAutoswapOn
              ? 'Autoswap related settings, accesable only when autoswap is turned on.'
              : ''
          }
          classes={{ tooltip: classes.tooltip }}>
          <div>
            <Button
              onClick={handleClickDepositOptions}
              className={classes.optionsIconBtn}
              disableRipple
              disabled={!isAutoswapOn}>
              <img
                src={settingIcon}
                className={!isAutoswapOn ? classes.grayscaleIcon : classes.whiteIcon}
                alt='options'
              />
            </Button>
          </div>
        </Tooltip>
      </>
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
          <Tooltip
            title={'You already have enough tokens to open position'}
            classes={{ tooltip: classes.tooltip }}>
            <img
              src={infoIcon}
              alt=''
              width='12px'
              style={{ marginRight: '4px', marginBottom: '-1.5px' }}
              className={classes.grayscaleIcon}
            />
          </Tooltip>
          No swap required
        </Box>
      )
    }

    if (isSimulationStatus(SwapAndCreateSimulationStatus.LiquidityTooLow)) {
      return (
        <Box className={classes.errorWarning}>
          <Tooltip
            title={'There is not enough liquidity to perform the swap'}
            classes={{ tooltip: classes.tooltip }}>
            <img
              src={infoIcon}
              alt=''
              width='12px'
              style={{ marginRight: '4px', marginBottom: '-1.5px' }}
              className={classes.errorIcon}
            />
          </Tooltip>
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
              <img
                src={infoIcon}
                alt=''
                width='12px'
                style={{ marginRight: '4px', marginBottom: '-1.5px' }}
                className={classes.errorIcon}
              />
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
              position is opened.
              {isPriceImpact ? (
                <>
                  {' '}
                  In order to create position you have to either:
                  <p>1. Open several smaller positions rather than a single large one.</p>
                  <p>2. Change swap price impact tolerance in the settings.</p>
                </>
              ) : (
                ''
              )}
            </>
          }>
          <Box display='flex' alignItems='center'>
            <img
              src={infoIcon}
              alt=''
              width='12px'
              style={{ marginRight: '4px', marginBottom: '-1.5px' }}
              className={isPriceImpact ? classes.errorIcon : classes.grayscaleIcon}
            />
            Price impact:{' '}
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
  }, [isSimulating, simulation, alignment, tokenACheckbox, tokenBCheckbox, throttle, isPriceImpact])

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
    if (!autoSwapPoolData || !autoSwapTicks || !autoSwapTickmap || !simulationParams.price) {
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
        autoSwapTickmap,
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
        autoSwapTickmap,
        toDecimal(+Number(slippageToleranceSwap).toFixed(4), 2),
        toDecimal(+Number(slippageToleranceCreatePosition).toFixed(4), 2),
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
    autoSwapTickmap,
    autoSwapTicks,
    isLoadingTicksOrTickmap,
    priceImpact,
    slippageToleranceCreatePosition,
    slippageToleranceSwap,
    utilization,
    valueA,
    valueB
  ])

  return (
    <Grid container className={cx(classes.wrapper, className)}>
      <DepoSitOptionsModal
        initialMaxPriceImpact={initialMaxPriceImpact}
        setMaxPriceImpact={setMaxPriceImpact}
        initialMinUtilization={initialMinUtilization}
        setMinUtilization={setMinUtilization}
        initialMaxSlippageToleranceSwap={initialMaxSlippageToleranceSwap}
        setMaxSlippageToleranceSwap={setMaxSlippageToleranceSwap}
        initialMaxSlippageToleranceCreatePosition={initialMaxSlippageToleranceCreatePosition}
        setMaxSlippageToleranceCreatePosition={setMaxSlippageToleranceCreatePosition}
        handleClose={handleCloseDepositOptions}
        open={settings}
      />
      <Typography className={classes.sectionTitle}>Tokens</Typography>

      <Grid container className={classes.sectionWrapper} style={{ marginBottom: 40 }}>
        <Grid container className={classes.selects}>
          <Grid className={classes.selectWrapper}>
            <Select
              tokens={tokens}
              current={tokenAIndex !== null ? tokens[tokenAIndex] : null}
              onSelect={index => {
                setTokenAIndex(index)
                setPositionTokens(index, tokenBIndex, feeTierIndex)
              }}
              centered
              className={classes.customSelect}
              handleAddToken={handleAddToken}
              sliceName
              commonTokens={commonTokens}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Grid>

          <TooltipHover title='Reverse tokens'>
            <img
              className={classes.arrows}
              src={swapListIcon}
              alt='Arrow'
              onClick={reverseTokens}
            />
          </TooltipHover>

          <Grid className={classes.selectWrapper}>
            <Select
              tokens={tokens}
              current={tokenBIndex !== null ? tokens[tokenBIndex] : null}
              onSelect={index => {
                setTokenBIndex(index)
                setPositionTokens(tokenAIndex, index, feeTierIndex)
              }}
              centered
              className={classes.customSelect}
              handleAddToken={handleAddToken}
              sliceName
              commonTokens={commonTokens}
              initialHideUnknownTokensValue={initialHideUnknownTokensValue}
              onHideUnknownTokensChange={e => {
                onHideUnknownTokensChange(e)
                setHideUnknownTokens(e)
              }}
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
            />
          </Grid>
        </Grid>

        <FeeSwitch
          containerKey={`${tokenAIndex}` + `${tokenBIndex}`}
          showTVL={tokenAIndex !== null && tokenBIndex !== null}
          onSelect={fee => {
            setPositionTokens(tokenAIndex, tokenBIndex, fee)
          }}
          feeTiers={feeTiers}
          showOnlyPercents
          promotedPoolTierIndex={promotedPoolTierIndex}
          currentValue={feeTierIndex}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
          isLoadingStats={isLoadingStats}
        />
      </Grid>
      <Grid container className={classes.depositHeader}>
        <Box className={classes.depositHeaderContainer}>
          <Typography className={classes.subsectionTitle}>Deposit Amount</Typography>

          <Box className={classes.depositOptions}>
            {!breakpoint630Down &&
              !breakpointMdTo1000 &&
              !brekpoint1270to1350 &&
              isAutoswapOn &&
              isAutoSwapAvailable &&
              (tokenACheckbox || tokenBCheckbox) &&
              renderWarning()}
            {renderSwitcher()}
          </Box>
        </Box>
        {(breakpoint630Down || breakpointMdTo1000 || brekpoint1270to1350) &&
          isAutoswapOn &&
          isAutoSwapAvailable && (
            <Box className={classes.depositHeaderContainer}>{renderWarning()}</Box>
          )}
      </Grid>
      <Grid container className={classes.sectionWrapper}>
        <Box className={cx(classes.inputWrapper, classes.inputFirst)}>
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: isAutoswapOn ? '31px' : '0px',
              opacity: isAutoswapOn ? 1 : 0
            }}>
            <Tooltip
              title={
                tokenACheckbox
                  ? 'Unmark to exclude this token as liquidity available for use in the new position'
                  : 'Mark to include this token as liquidity available for use in the new position'
              }
              classes={{ tooltip: classes.tooltip }}>
              <Checkbox
                checked={tokenACheckbox}
                onChange={e => setTokenACheckbox(e.target.checked)}
                className={classes.checkbox}
                icon={<span className={classes.customIcon} />}
              />
            </Tooltip>
          </Box>
          <DepositAmountInput
            tokenPrice={priceA}
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
        <Box className={cx(classes.inputWrapper, classes.inputSecond)}>
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: isAutoswapOn ? '31px' : '0px',
              opacity: isAutoswapOn ? 1 : 0
            }}>
            {' '}
            <Tooltip
              title={
                tokenBCheckbox
                  ? 'Unmark to exclude this token as liquidity available for use in the new position'
                  : 'Mark to include this token as liquidity available for use in the new position'
              }
              classes={{ tooltip: classes.tooltip }}>
              <Checkbox
                checked={tokenBCheckbox}
                onChange={e => {
                  setTokenBCheckbox(e.target.checked)
                }}
                className={classes.checkbox}
                icon={<span className={classes.customIcon} />}
              />
            </Tooltip>
          </Box>
          <DepositAmountInput
            tokenPrice={priceB}
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
      <Box width='100%'>
        {walletStatus !== Status.Initialized ? (
          <ChangeWalletButton
            margin={'30px 0'}
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
                disabled={getButtonMessage() !== 'Add Position'}
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
                  onAddLiquidity()
                } else if (
                  isAutoswapOn &&
                  isSimulationStatus(SwapAndCreateSimulationStatus.PerfectRatio)
                ) {
                  onAddLiquidity()
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
                      toDecimal(+Number(slippageToleranceCreatePosition).toFixed(4), 2),
                      userMinUtilization
                    )
                  }
                }
              }
            }}
            disabled={getButtonMessage() !== 'Add Position'}
            content={getButtonMessage()}
            progress={progress}
          />
        )}
      </Box>
    </Grid>
  )
}

export default DepositSelector
