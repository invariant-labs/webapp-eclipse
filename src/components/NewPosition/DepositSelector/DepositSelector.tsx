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
import classNames from 'classnames'
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
import icons from '@static/icons'
import { PoolWithAddress } from '@store/reducers/pools'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import {
  DECIMAL,
  SimulateSwapAndCreatePositionSimulation,
  SimulationStatus,
  toDecimal
} from '@invariant-labs/sdk-eclipse/lib/utils'
import DepoSitOptionsModal from '@components/Modals/DepositOptionsModal/DepositOptionsModal'
import { theme } from '@static/theme'

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
    actualPoolPrice: BN | null
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
  const { classes } = useStyles()
  const breakpoint630Down = useMediaQuery(theme.breakpoints.down(630))
  const brekpoint1270to1350 = useMediaQuery(theme.breakpoints.between(1270, 1350))
  const breakpointMdTo1000 = useMediaQuery(theme.breakpoints.between('md', 1000))
  const { value: valueA } = tokenAInputState
  const { value: valueB } = tokenBInputState
  const [priceImpact, setPriceImpact] = useState<string>(initialMaxPriceImpact)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
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

  const WETH_MIN_FEE_LAMPORTS = useMemo(() => {
    if (network === NetworkType.Testnet) {
      if (alignment === DepositOptions.Auto) {
        return WETH_SWAP_AND_POSITION_INIT_LAMPORTS_TEST
      }
      return isCurrentPoolExisting ? WETH_POSITION_INIT_LAMPORTS_TEST : WETH_POOL_INIT_LAMPORTS_TEST
    } else {
      if (alignment === DepositOptions.Auto) {
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

    setIsLoaded(true)
  }, [tokens, initialTokenFrom, initialTokenTo, initialFee])

  const [wasRunTokenA, setWasRunTokenA] = useState(false)
  const [wasRunTokenB, setWasRunTokenB] = useState(false)

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
    // if (isLoadingTicksOrTickmap) {
    //   return 'Loading data...'
    // }
    if (isLoadingTicksOrTickmap || throttle || isSimulating) {
      return 'Loading'
    }

    if (tokenAIndex === null || tokenBIndex === null) {
      return 'Select tokens'
    }

    if (tokenAIndex === tokenBIndex) {
      return 'Select different tokens'
    }

    if (alignment === DepositOptions.Auto && isError(SimulationStatus.NoGainSwap)) {
      return 'Insufficient Amount'
    }

    if (
      alignment === DepositOptions.Auto &&
      (isError(SimulationStatus.SwapStepLimitReached) ||
        isError(SimulationStatus.PriceLimitReached) ||
        isError(SimulationStatus.LimitReached))
    ) {
      return 'Insufficient Liquidity'
    }

    if (
      alignment === DepositOptions.Auto &&
      simulation &&
      simulation.swapSimulation &&
      new BN(simulation.swapSimulation.priceImpact).gt(
        toDecimal(+Number(priceImpact).toFixed(4), 2)
      )
    ) {
      return 'Price impact reached'
    }

    if (isAutoSwapAvailable && !tokenACheckbox && !tokenBCheckbox) {
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
      alignment === DepositOptions.Auto
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
      alignment === DepositOptions.Basic
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
      alignment === DepositOptions.Auto
    ) {
      return 'Enter token amount'
    }

    // if (alignment === DepositOptions.Auto && simulation === null && !throttle && !isSimulating) {
    //   return 'Simulation error'
    // }

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

    if (alignment === DepositOptions.Auto) {
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
        setTokenACheckbox(true)
        setTokenBCheckbox(true)
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

  const isError = useCallback(
    (value: SimulationStatus) => {
      return simulation && simulation.swapSimulation && simulation.swapSimulation.status === value
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
              left: alignment === DepositOptions.Basic ? 0 : '50%'
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
              className={classNames(
                classes.switchDepositTypeButton,
                alignment === DepositOptions.Basic
                  ? classes.switchSelected
                  : classes.switchNotSelected
              )}>
              Basic
            </ToggleButton>
            <ToggleButton
              disabled={!isAutoSwapAvailable}
              value={DepositOptions.Auto}
              disableRipple
              className={classNames(
                classes.switchDepositTypeButton,
                classes.autoButton,
                alignment === DepositOptions.Auto
                  ? classes.switchSelected
                  : classes.switchNotSelected
              )}>
              <span className={classes.autoText}>Auto</span>
              {isAutoSwapAvailable && (
                <Tooltip
                  title={
                    'Autoswap automatically adjusts tokens balances to match your chosen ratio, saving time and optimizing transactions. By default, it executes the most optimal swap, while the manual mode allows you to set parameters such as max price impact or minimum utilization.'
                  }
                  classes={{ tooltip: classes.tooltip }}>
                  <span className={classes.tooltipIconWrapper}>
                    <img src={icons.infoCircle} alt='' width={'12px'} height={'12px'} />
                  </span>
                </Tooltip>
              )}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Button
          onClick={handleClickDepositOptions}
          className={classes.optionsIconBtn}
          disableRipple
          disabled={!isAutoSwapAvailable}>
          <img
            src={icons.settingCirc}
            className={!isAutoSwapAvailable ? classes.grayscaleIcon : classes.whiteIcon}
            alt='options'
          />
        </Button>
      </>
    ),
    [isAutoSwapAvailable, alignment]
  )

  const renderPriceImpactWarning = useCallback(() => {
    if (isSimulating) {
      return <Skeleton variant='rectangular' className={classes.skeleton} />
    }
    if (
      (!simulation?.swapSimulation && !simulation?.position?.liquidity.eqn(0)) ||
      !simulation?.swapSimulation?.priceImpact
    ) {
      return (
        <Box className={classes.unknownWarning}>
          <Tooltip
            title={'You already have enough tokens to open position'}
            classes={{ tooltip: classes.tooltip }}>
            <img
              src={icons.infoCircle}
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
    return (
      <Box
        className={
          new BN(simulation?.swapSimulation?.priceImpact ?? 0).lt(
            toDecimal(+Number(priceImpact).toFixed(4), 2)
          )
            ? classes.unknownWarning
            : classes.errorWarning
        }>
        <Tooltip
          title={
            <>
              Impact on the price for token exchange.
              {new BN(simulation?.swapSimulation?.priceImpact ?? 0).gt(
                toDecimal(+Number(priceImpact).toFixed(4), 2)
              ) ? (
                <>
                  {' '}
                  In order to create position you have to either:
                  <p>1. Split the position into smaller ones to minimize prize impact.</p>
                  <p>2. Change swap price impact tolerance in the settings.</p>
                </>
              ) : (
                ''
              )}
            </>
          }
          classes={{ tooltip: classes.tooltip }}>
          <img
            src={icons.infoCircle}
            alt=''
            width='12px'
            style={{ marginRight: '4px', marginBottom: '-1.5px' }}
            className={
              new BN(simulation?.swapSimulation?.priceImpact ?? 0).lte(
                toDecimal(+Number(priceImpact).toFixed(4), 2)
              )
                ? classes.grayscaleIcon
                : classes.errorIcon
            }
          />
        </Tooltip>
        Price impact:{' '}
        {!simulation || !simulation.swapSimulation
          ? '0'
          : simulation?.swapSimulation?.priceImpact.gt(new BN(MINIMUM_PRICE_IMPACT))
            ? Number(printBN(new BN(simulation?.swapSimulation?.priceImpact), DECIMAL - 2)).toFixed(
                2
              )
            : `<${Number(printBN(MINIMUM_PRICE_IMPACT, DECIMAL - 2)).toFixed(2)}`}
        %
      </Box>
    )
  }, [isSimulating, simulation, alignment, tokenACheckbox, tokenBCheckbox])

  const simulateAutoSwapResult = async () => {
    setIsSimulating(true)
    if (
      !autoSwapPoolData ||
      !autoSwapTicks ||
      !autoSwapTickmap ||
      tokenAIndex === null ||
      tokenBIndex === null ||
      isLoadingTicksOrTickmap ||
      !simulationParams.actualPoolPrice
    ) {
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
        simulationParams.upperTickIndex
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
        simulationParams.actualPoolPrice
      )
    }
    if (result) {
      updateLiquidity(result.position.liquidity)
    }
    console.log(result)
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
    if ((tokenACheckbox || tokenBCheckbox) && alignment === DepositOptions.Auto) {
      // simulateAutoSwapResult()
      simulateWithTimeout()
    }
  }, [
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
    <Grid container className={classNames(classes.wrapper, className)}>
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
              src={icons.swapListIcon}
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
              alignment === DepositOptions.Auto &&
              isAutoSwapAvailable &&
              (tokenACheckbox || tokenBCheckbox) &&
              renderPriceImpactWarning()}
            {renderSwitcher()}
          </Box>
        </Box>
        {(breakpoint630Down || breakpointMdTo1000 || brekpoint1270to1350) &&
          alignment === DepositOptions.Auto &&
          isAutoSwapAvailable && (
            <Box className={classes.depositHeaderContainer}>{renderPriceImpactWarning()}</Box>
          )}
      </Grid>
      <Grid container className={classes.sectionWrapper}>
        <Box className={classNames(classes.inputWrapper, classes.inputFirst)}>
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: alignment === DepositOptions.Auto ? '31px' : '0px',
              opacity: alignment === DepositOptions.Auto ? 1 : 0
            }}>
            <Tooltip
              title={
                tokenACheckbox
                  ? "Disabling this input means you don't need to provide the corresponding token"
                  : 'Enable to provide this token'
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
              tokenAIndex !== null ? tokens[tokenAIndex].isUnknown ?? false : false
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
        <Box className={classNames(classes.inputWrapper, classes.inputSecond)}>
          <Box
            className={classes.checkboxWrapper}
            style={{
              width: alignment === DepositOptions.Auto ? '31px' : '0px',
              opacity: alignment === DepositOptions.Auto ? 1 : 0
            }}>
            {' '}
            <Tooltip
              title={
                tokenBCheckbox
                  ? "Disabling this input means you don't need to provide the corresponding token"
                  : 'Enable to provide this token'
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
              tokenBIndex !== null ? tokens[tokenBIndex].isUnknown ?? false : false
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
            <AnimatedButton
              className={classNames(
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
          </TooltipHover>
        ) : (
          <AnimatedButton
            className={classNames(
              classes.addButton,
              progress === 'none' ? classes.hoverButton : undefined
            )}
            onClick={() => {
              if (progress === 'none' && tokenAIndex !== null && tokenBIndex !== null) {
                if (alignment === DepositOptions.Basic) {
                  onAddLiquidity()
                } else if (
                  alignment === DepositOptions.Auto &&
                  simulation &&
                  !simulation.swapInput &&
                  !simulation.swapSimulation &&
                  simulation.position
                ) {
                  onAddLiquidity()
                } else {
                  if (
                    (tokenACheckbox || tokenBCheckbox) &&
                    simulation &&
                    simulation.swapSimulation &&
                    simulation.swapInput &&
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
