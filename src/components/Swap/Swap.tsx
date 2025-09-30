import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@common/Refresher/Refresher'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Collapse, Grid, Typography, useMediaQuery } from '@mui/material'
import {
  ALL_FEE_TIERS_DATA,
  DEFAULT_TOKEN_DECIMAL,
  inputTarget,
  NetworkType,
  REFRESHER_INTERVAL,
  SwapType,
  WETH_MAIN,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  addressToTicker,
  convertBalanceToBN,
  findPairs,
  formatNumberWithoutSuffix,
  handleSimulate,
  handleSimulateWithHop,
  initialXtoY,
  printBN,
  ROUTES,
  trimLeadingZeros
} from '@utils/utils'
import { Swap as SwapData } from '@store/reducers/swap'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { blurContent, createButtonActions, unblurContent } from '@utils/uiUtils'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import TransactionDetailsBox from './TransactionDetailsBox/TransactionDetailsBox'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import TokensInfo from './TokensInfo/TokensInfo'
import { VariantType } from 'notistack'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { DECIMAL, fromFee, SimulationStatus } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PoolWithAddress } from '@store/reducers/pools'
import { PublicKey } from '@solana/web3.js'
import { Tick, Tickmap, Market } from '@invariant-labs/sdk-eclipse/lib/market'
import { auditIcon, refreshIcon, settingIcon, swapArrowsIcon, warningIcon } from '@static/icons'
import { useNavigate } from 'react-router-dom'
import { FetcherRecords, Pair, SimulationTwoHopResult } from '@invariant-labs/sdk-eclipse'
import { theme } from '@static/theme'
import Chart from './Chart/Chart'
import { ExtendedPoolStatsData } from '@store/selectors/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'

export interface Pools {
  tokenX: PublicKey
  tokenY: PublicKey
  tokenXReserve: PublicKey
  tokenYReserve: PublicKey
  tickSpacing: number
  sqrtPrice: {
    v: BN
    scale: number
  }
  fee: {
    val: BN
    scale: number
  }
  exchangeRate: {
    val: BN
    scale: number
  }
}

export interface ISwap {
  isFetchingNewPool: boolean
  onRefresh: (tokenFrom: number | null, tokenTo: number | null) => void
  walletStatus: Status
  swapData: SwapData
  tokens: SwapToken[]
  pools: PoolWithAddress[]
  tickmap: { [x: string]: Tickmap }
  onSwap: (
    slippage: BN,
    knownPrice: BN,
    tokenFrom: PublicKey,
    tokenBetween: PublicKey | null,
    tokenTo: PublicKey,
    firstPair: Pair,
    secondPair: Pair | null,
    amountIn: BN,
    amountOut: BN,
    byAmountIn: boolean
  ) => void
  onSetPair: (tokenFrom: PublicKey | null, tokenTo: PublicKey | null) => void
  progress: ProgressState
  poolTicks: { [x: string]: Tick[] }
  isWaitingForNewPool: boolean
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  initialTokenFromIndex: number | null
  initialTokenToIndex: number | null
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  tokenFromPriceData?: TokenPriceData
  tokenToPriceData?: TokenPriceData
  priceFromLoading?: boolean
  priceToLoading?: boolean
  onSlippageChange: (slippage: string) => void
  initialSlippage: string
  isBalanceLoading: boolean
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  ethBalance: BN
  unwrapWETH: () => void
  wrappedETHAccountExist: boolean
  isTimeoutError: boolean
  deleteTimeoutError: () => void
  canNavigate: boolean
  market: Market
  tokensDict: Record<string, SwapToken>
  swapAccounts: FetcherRecords
  swapIsLoading: boolean
  wrappedETHBalance: BN | null
  updateInterval: (interval: IntervalsKeys) => void
  poolsList: ExtendedPoolStatsData[]
  lastUsedInterval: IntervalsKeys | null
  selectedFee: BN | null
  selectFeeTier: (i: number) => void
  chartPoolData: PoolWithAddress | null
}

export type SimulationPath = {
  tokenFrom: SwapToken | null
  tokenBetween: SwapToken | null
  tokenTo: SwapToken | null
  firstPair: BN | null
  secondPair: BN | null
  firstAmount: BN | null
  secondAmount: BN | null
  firstPriceImpact: BN | null
  secondPriceImpact: BN | null
}

export const Swap: React.FC<ISwap> = ({
  isFetchingNewPool,
  onRefresh,
  walletStatus,
  tokens,
  pools,
  tickmap,
  onSwap,
  onSetPair,
  progress,
  poolTicks,
  isWaitingForNewPool,
  onConnectWallet,
  onDisconnectWallet,
  initialTokenFromIndex,
  initialTokenToIndex,
  handleAddToken,
  commonTokens,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  tokenFromPriceData,
  tokenToPriceData,
  priceFromLoading,
  priceToLoading,
  onSlippageChange,
  initialSlippage,
  isBalanceLoading,
  copyTokenAddressHandler,
  network,
  ethBalance,
  unwrapWETH,
  wrappedETHAccountExist,
  wrappedETHBalance,
  isTimeoutError,
  deleteTimeoutError,
  canNavigate,
  market,
  tokensDict,
  swapAccounts,
  swapIsLoading,
  updateInterval,
  poolsList,
  lastUsedInterval,
  selectedFee,
  selectFeeTier,
  chartPoolData
}) => {
  const { classes, cx } = useStyles()

  const [tokenFromIndex, setTokenFromIndex] = React.useState<number | null>(null)
  const [tokenToIndex, setTokenToIndex] = React.useState<number | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [lockAnimation, setLockAnimation] = React.useState<boolean>(false)
  const [amountFrom, setAmountFrom] = React.useState<string>('')
  const [amountTo, setAmountTo] = React.useState<string>('')
  const [swap, setSwap] = React.useState<boolean | null>(null)
  const [rotates, setRotates] = React.useState<number>(0)
  const [slippTolerance, setSlippTolerance] = React.useState<string>(initialSlippage)
  const [throttle, setThrottle] = React.useState<boolean>(false)
  const [settings, setSettings] = React.useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)
  const [inputRef, setInputRef] = React.useState<string>(inputTarget.DEFAULT)
  const [rateReversed, setRateReversed] = React.useState<boolean>(
    tokenFromIndex && tokenToIndex
      ? !initialXtoY(
          tokens[tokenFromIndex].assetAddress.toString(),
          tokens[tokenToIndex].assetAddress.toString()
        )
      : false
  )
  const [rateLoading, setRateLoading] = React.useState<boolean>(false)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )
  const txDown = useMediaQuery(theme.breakpoints.down(483))
  const txDown2 = useMediaQuery(theme.breakpoints.down(360))

  const [simulateResult, setSimulateResult] = React.useState<{
    amountOut: BN
    poolIndex: number
    AmountOutWithFee: BN
    estimatedPriceAfterSwap: BN
    minimumReceived: BN
    priceImpact: BN
    error: string[]
  }>({
    amountOut: new BN(0),
    poolIndex: 0,
    AmountOutWithFee: new BN(0),
    estimatedPriceAfterSwap: new BN(0),
    minimumReceived: new BN(0),
    priceImpact: new BN(0),
    error: []
  })
  const [simulateWithHopResult, setSimulateWithHopResult] = useState<{
    simulation: SimulationTwoHopResult | null
    route: [Pair, Pair] | null
    error: boolean
  }>({ simulation: null, route: null, error: false })
  const [simulationPath, setSimulationPath] = useState<SimulationPath>({
    tokenFrom: null,
    tokenBetween: null,
    tokenTo: null,
    firstPair: null,
    secondPair: null,
    firstAmount: null,
    secondAmount: null,
    firstPriceImpact: null,
    secondPriceImpact: null
  })
  const [bestAmount, setBestAmount] = useState(new BN(0))
  const [swapType, setSwapType] = useState(SwapType.Normal)
  const [addBlur, setAddBlur] = useState(false)
  const [wasIsFetchingNewPoolRun, setWasIsFetchingNewPoolRun] = useState(false)
  const [wasSwapIsLoadingRun, setWasSwapIsLoadingRun] = useState(false)
  const [isReversingTokens, setIsReversingTokens] = useState(false)
  const shortenText = useMediaQuery(theme.breakpoints.down(500))
  const shortenTextXS = useMediaQuery(theme.breakpoints.down(360))

  const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT = useMemo(() => {
    if (network === NetworkType.Testnet) {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST
    } else {
      return WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN
    }
  }, [network])

  const priceImpact = Math.max(
    +printBN(+simulationPath.firstPriceImpact, DECIMAL - 2),
    +printBN(+simulationPath.secondPriceImpact, DECIMAL - 2)
  )

  const timeoutRef = useRef<number>(0)

  const navigate = useNavigate()

  useEffect(() => {
    if (isTimeoutError) {
      onRefresh(tokenFromIndex, tokenToIndex)
      deleteTimeoutError()
    }
  }, [isTimeoutError])

  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!tokens.length) return
    if (tokenFromIndex === null || tokenToIndex === null) return
    if (!tokens[tokenFromIndex] || !tokens[tokenToIndex]) return

    clearTimeout(urlUpdateTimeoutRef.current)
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const fromTicker = addressToTicker(network, tokens[tokenFromIndex].assetAddress.toString())
      const toTicker = addressToTicker(network, tokens[tokenToIndex].assetAddress.toString())
      const newPath = ROUTES.getExchangeRoute(fromTicker, toTicker)

      if (newPath !== window.location.pathname && !newPath.includes('/-/')) {
        navigate(newPath, { replace: true })
      }
    }, 500)

    return () => clearTimeout(urlUpdateTimeoutRef.current)
  }, [
    tokenFromIndex,
    tokenToIndex,
    tokens.length,
    network,
    simulationPath.tokenFrom,
    simulationPath.tokenBetween,
    simulationPath.tokenTo
  ])

  useEffect(() => {
    if (!!tokens.length && tokenFromIndex === null && tokenToIndex === null && canNavigate) {
      setTokenFromIndex(initialTokenFromIndex)
      setTokenToIndex(initialTokenToIndex)
    }
  }, [tokens.length, canNavigate, initialTokenFromIndex, initialTokenToIndex])

  useEffect(() => {
    onSetPair(
      tokenFromIndex === null ? null : tokens[tokenFromIndex].assetAddress,
      tokenToIndex === null ? null : tokens[tokenToIndex].assetAddress
    )
  }, [tokenFromIndex, tokenToIndex, pools.length])

  useEffect(() => {
    if (
      inputRef === inputTarget.FROM &&
      !isReversingTokens &&
      !(amountFrom === '' && amountTo === '')
    ) {
      simulateWithTimeout()
    }
  }, [
    amountFrom,
    // tokenToIndex,
    // tokenFromIndex,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (
      inputRef === inputTarget.TO &&
      !isReversingTokens &&
      !(amountFrom === '' && amountTo === '')
    ) {
      simulateWithTimeout()
    }
  }, [
    amountTo,
    // tokenToIndex,
    // tokenFromIndex,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (progress === 'none' && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [progress])

  const simulateWithTimeout = () => {
    setThrottle(true)

    clearTimeout(timeoutRef.current)
    const timeout = setTimeout(() => {
      setSimulateAmount().finally(() => {
        setThrottle(false)
      })
    }, 500)
    timeoutRef.current = timeout as unknown as number
  }

  useEffect(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      if (inputRef === inputTarget.FROM) {
        const amount = getAmountOut(tokens[tokenToIndex])
        setAmountTo(+amount === 0 ? '' : trimLeadingZeros(amount))
      } else if (tokenFromIndex !== null) {
        const amount = getAmountOut(tokens[tokenFromIndex])
        setAmountFrom(+amount === 0 ? '' : trimLeadingZeros(amount))
      } else if (!tokens[tokenToIndex]) {
        setAmountTo('')
      } else if (!tokens[tokenFromIndex]) {
        setAmountFrom('')
      }
    }

    setAddBlur(false)
  }, [bestAmount, simulateResult, simulateWithHopResult])

  useEffect(() => {
    updateEstimatedAmount()
  }, [tokenToIndex, tokenFromIndex, pools.length])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (refresherTime > 0 && tokenFromIndex !== null && tokenToIndex !== null) {
        setRefresherTime(refresherTime - 1)
      } else {
        handleRefresh()
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [refresherTime, tokenFromIndex, tokenToIndex])

  useEffect(() => {
    if (inputRef !== inputTarget.DEFAULT) {
      const temp: string = amountFrom
      setAmountFrom(amountTo)
      setAmountTo(temp)
      setInputRef(inputRef === inputTarget.FROM ? inputTarget.TO : inputTarget.FROM)
    }
  }, [swap])

  useEffect(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      setRateReversed(
        !initialXtoY(
          tokens[tokenFromIndex].assetAddress.toString(),
          tokens[tokenToIndex].assetAddress.toString()
        )
      )
      setRateLoading(false)
    }
  }, [tokenFromIndex, tokenToIndex])

  const getAmountOut = (assetFor: SwapToken) => {
    const amountOut: number = Number(printBN(bestAmount, assetFor.decimals))

    return amountOut.toFixed(assetFor.decimals)
  }

  const setSimulateAmount = async () => {
    setAddBlur(true)
    if (tokenFromIndex !== null && tokenToIndex !== null && !swapIsLoading) {
      if (inputRef === inputTarget.FROM) {
        const [simulateValue, simulateWithHopValue] = await Promise.all([
          handleSimulate(
            pools,
            poolTicks,
            tickmap,
            fromFee(new BN(Number(+slippTolerance * 1000))),
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
            true
          ),
          handleSimulateWithHop(
            market,
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
            true,
            swapAccounts
          )
        ])

        updateSimulation(simulateValue, simulateWithHopValue)
        setSimulateResult(simulateValue)
        setSimulateWithHopResult(simulateWithHopValue)
      } else if (inputRef === inputTarget.TO) {
        const [simulateValue, simulateWithHopValue] = await Promise.all([
          handleSimulate(
            pools,
            poolTicks,
            tickmap,
            fromFee(new BN(Number(+slippTolerance * 1000))),
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
            false
          ),
          handleSimulateWithHop(
            market,
            tokens[tokenFromIndex].assetAddress,
            tokens[tokenToIndex].assetAddress,
            convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
            false,
            swapAccounts
          )
        ])

        updateSimulation(simulateValue, simulateWithHopValue)
        setSimulateResult(simulateValue)
        setSimulateWithHopResult(simulateWithHopValue)
      }
    } else {
      setAddBlur(false)
    }
  }

  const updateSimulation = (
    simulateResult: {
      amountOut: BN
      poolIndex: number
      AmountOutWithFee: BN
      estimatedPriceAfterSwap: BN
      minimumReceived: BN
      priceImpact: BN
      error: string[]
    },
    simulateWithHopResult: {
      simulation: SimulationTwoHopResult | null
      route: [Pair, Pair] | null
      error: boolean
    }
  ) => {
    let useTwoHop = false

    const isSimulateError =
      simulateResult.error.length > 0 || simulateResult.amountOut.eq(new BN(0))
    const isSimulateWithHopError = simulateWithHopResult.error

    if (isSimulateError && !isSimulateWithHopError) {
      useTwoHop = true
    }

    if (
      (isSimulateError && isSimulateWithHopError) ||
      (!isSimulateError && !isSimulateWithHopError)
    ) {
      if (inputRef === inputTarget.FROM) {
        if (
          simulateWithHopResult?.simulation?.totalAmountOut.gte(simulateResult.amountOut) &&
          !simulateWithHopResult.error
        ) {
          useTwoHop = true
        }
      } else {
        if (
          simulateWithHopResult?.simulation?.totalAmountIn
            .add(simulateWithHopResult?.simulation?.swapHopOne.accumulatedFee)
            .lte(simulateResult.amountOut) &&
          !simulateWithHopResult.error
        ) {
          useTwoHop = true
        }
      }
    }

    if (useTwoHop && simulateWithHopResult.simulation && simulateWithHopResult.route) {
      setSimulationPath({
        tokenFrom: tokens[tokenFromIndex ?? 0],
        tokenBetween:
          tokensDict[
            simulateWithHopResult.simulation.xToYHopOne
              ? simulateWithHopResult.route[0].tokenY.toString()
              : simulateWithHopResult.route[0].tokenX.toString()
          ],
        tokenTo: tokens[tokenToIndex ?? 0],
        firstPair: simulateWithHopResult.route[0],
        secondPair: simulateWithHopResult.route[1],
        firstAmount: simulateWithHopResult.simulation.swapHopOne.accumulatedAmountIn.add(
          simulateWithHopResult.simulation.swapHopOne.accumulatedFee
        ),
        secondAmount: simulateWithHopResult.simulation.swapHopTwo.accumulatedAmountIn.add(
          simulateWithHopResult.simulation.swapHopTwo.accumulatedFee
        ),
        firstPriceImpact: simulateWithHopResult.simulation.swapHopOne.priceImpact,
        secondPriceImpact: simulateWithHopResult.simulation.swapHopTwo.priceImpact
      })
      setBestAmount(
        inputRef === inputTarget.FROM
          ? simulateWithHopResult.simulation.swapHopTwo.accumulatedAmountOut
          : simulateWithHopResult.simulation.swapHopOne.accumulatedAmountIn.add(
              simulateWithHopResult.simulation.swapHopOne.accumulatedFee
            )
      )
      setSwapType(SwapType.WithHop)
    } else {
      setSimulationPath({
        tokenFrom: tokens[tokenFromIndex ?? 0],
        tokenBetween: null,
        tokenTo: tokens[tokenToIndex ?? 0],
        firstPair: new Pair(
          pools[simulateResult.poolIndex].tokenX,
          pools[simulateResult.poolIndex].tokenY,
          {
            fee: pools[simulateResult.poolIndex].fee,
            tickSpacing: pools[simulateResult.poolIndex].tickSpacing
          }
        ) ?? { fee: new BN(0) },
        secondPair: null,
        firstAmount: convertBalanceToBN(amountFrom, tokens[tokenFromIndex ?? 0].decimals),
        secondAmount: null,
        firstPriceImpact: simulateResult.priceImpact,
        secondPriceImpact: null
      })
      setBestAmount(simulateResult.amountOut)
      setSwapType(SwapType.Normal)
    }
  }

  const getIsXToY = (fromToken: PublicKey, toToken: PublicKey) => {
    const swapPool = pools.find(
      pool =>
        (fromToken.equals(pool.tokenX) && toToken.equals(pool.tokenY)) ||
        (fromToken.equals(pool.tokenY) && toToken.equals(pool.tokenX))
    )
    return !!swapPool
  }

  const updateEstimatedAmount = () => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      const amount = getAmountOut(tokens[tokenToIndex])
      setAmountTo(+amount === 0 ? '' : trimLeadingZeros(amount))
    }
  }
  const isError = (error: string) => {
    return swapType === SwapType.Normal ? simulateResult.error.some(err => err === error) : false
  }

  const isEveryPoolEmpty = useMemo(() => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      const pairs = findPairs(
        tokens[tokenFromIndex].assetAddress,
        tokens[tokenToIndex].assetAddress,
        pools
      )

      let poolEmptyCount = 0
      for (const pair of pairs) {
        if (
          poolTicks[pair.address.toString()] === undefined ||
          (poolTicks[pair.address.toString()] && !poolTicks[pair.address.toString()].length)
        ) {
          poolEmptyCount++
        }
      }
      return poolEmptyCount === pairs.length
    }

    return true
  }, [tokenFromIndex, tokenToIndex, poolTicks])

  const getStateMessage = () => {
    if (
      amountFrom !== '' &&
      amountTo !== '' &&
      ((tokenFromIndex !== null && tokenToIndex !== null && throttle) ||
        isWaitingForNewPool ||
        isError("TypeError: Cannot read properties of undefined (reading 'bitmap')"))
    ) {
      return 'Loading'
    }
    if (tokenFromIndex !== null && tokenToIndex !== null && amountFrom === '' && amountTo === '') {
      return 'Enter amount'
    }
    if (walletStatus !== Status.Initialized) {
      return 'Connect a wallet'
    }

    if (tokenFromIndex === null || tokenToIndex === null) {
      return 'Select a token'
    }

    if (tokenFromIndex === tokenToIndex) {
      return 'Select different tokens'
    }

    if (
      !getIsXToY(tokens[tokenFromIndex].assetAddress, tokens[tokenToIndex].assetAddress) &&
      simulateWithHopResult.simulation === null &&
      simulateWithHopResult.route === null
    ) {
      return "Route doesn't exist."
    }

    if (
      isError(SimulationStatus.SwapStepLimitReached) ||
      (isError(SimulationStatus.PriceLimitReached) &&
        simulateWithHopResult.simulation === null &&
        simulateWithHopResult.route === null) ||
      (simulateWithHopResult.error && simulationPath.firstPair === null)
    ) {
      return 'Insufficient liquidity'
    }

    if (
      convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).gt(
        convertBalanceToBN(
          printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals),
          tokens[tokenFromIndex].decimals
        )
      )
    ) {
      return 'Insufficient balance'
    }

    if (
      tokens[tokenFromIndex].assetAddress.toString() === WRAPPED_ETH_ADDRESS
        ? ethBalance.lt(
            convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).add(
              WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT
            )
          )
        : ethBalance.lt(WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT)
    ) {
      return `Insufficient ETH`
    }

    if (
      convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals).eqn(0) ||
      isError(SimulationStatus.NoGainSwap)
    ) {
      return 'Insufficient amount'
    }

    if (!isEveryPoolEmpty && amountTo === '') {
      return 'Amount out is zero'
    }

    if (isEveryPoolEmpty && simulateWithHopResult.error) {
      return 'RPC connection error'
    }

    // Fallback error message
    if (swapType === SwapType.Normal && simulateResult.error.length !== 0) {
      console.warn('Errors not handled explictly', simulateResult.error)
      return 'Not enough liquidity'
    }

    return 'Exchange'
  }
  const hasShowRateMessage = () => {
    return (
      getStateMessage() === 'Insufficient balance' ||
      getStateMessage() === 'Exchange' ||
      getStateMessage() === 'Loading' ||
      getStateMessage() === 'Connect a wallet' ||
      getStateMessage() === 'Insufficient liquidity' ||
      getStateMessage() === 'Not enough liquidity' ||
      getStateMessage() === 'Insufficient ETH'
    )
  }
  const setSlippage = (slippage: string): void => {
    setSlippTolerance(slippage)
    onSlippageChange(slippage)
  }

  const handleClickSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setSettings(true)
  }

  const handleCloseSettings = () => {
    unblurContent()
    setSettings(false)
  }

  const handleOpenTransactionDetails = () => {
    setDetailsOpen(!detailsOpen)
  }
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (lockAnimation) {
      timeoutId = setTimeout(() => setLockAnimation(false), 300)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [lockAnimation])

  const swapRate =
    tokenFromIndex === null || tokenToIndex === null || amountFrom === '' || amountTo === ''
      ? 0
      : +amountTo / +amountFrom

  const canShowDetails =
    tokenFromIndex !== null &&
    tokenToIndex !== null &&
    hasShowRateMessage() &&
    (getStateMessage() === 'Loading' ||
      (swapRate !== 0 && swapRate !== Infinity && !isNaN(swapRate))) &&
    amountFrom !== '' &&
    amountTo !== ''

  const handleRefresh = async () => {
    setErrorVisible(false)
    onRefresh(tokenFromIndex, tokenToIndex)
    setRefresherTime(REFRESHER_INTERVAL)
  }

  useEffect(() => {
    if (isFetchingNewPool) {
      setAddBlur(true)
      setWasIsFetchingNewPoolRun(true)
    }
  }, [isFetchingNewPool])

  useEffect(() => {
    if (swapIsLoading) {
      setAddBlur(true)
      setWasSwapIsLoadingRun(true)
    }
  }, [swapIsLoading])

  useEffect(() => {
    if (wasIsFetchingNewPoolRun && wasSwapIsLoadingRun && !isFetchingNewPool && !swapIsLoading) {
      void setSimulateAmount()
      setWasIsFetchingNewPoolRun(false)
      setWasSwapIsLoadingRun(false)
      if (isReversingTokens) {
        setIsReversingTokens(false)
      }
    }
  }, [wasIsFetchingNewPoolRun, wasSwapIsLoadingRun, isFetchingNewPool, swapIsLoading])

  useEffect(() => {
    setRefresherTime(REFRESHER_INTERVAL)

    if (tokenFromIndex === tokenToIndex) {
      setAmountFrom('')
      setAmountTo('')
    }
  }, [tokenFromIndex, tokenToIndex])
  const actions = createButtonActions({
    tokens,
    wrappedTokenAddress: WRAPPED_ETH_ADDRESS,
    minAmount: WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT,
    onAmountSet: setAmountFrom,
    onSelectInput: () => setInputRef(inputTarget.FROM)
  })

  const oraclePriceDiffPercentage = useMemo(() => {
    if (!tokenFromPriceData || !tokenToPriceData) return 0

    const tokenFromValue = tokenFromPriceData.price * +amountFrom
    const tokenToValue = tokenToPriceData.price * +amountTo
    if (tokenFromValue === 0 || tokenToValue === 0) return 0
    if (tokenToValue > tokenFromValue) return 0

    return Math.abs((tokenFromValue - tokenToValue) / tokenFromValue) * 100
  }, [tokenFromPriceData, tokenToPriceData, amountFrom, amountTo])

  const showBlur = useMemo(() => {
    return (
      (inputRef === inputTarget.FROM && addBlur) ||
      lockAnimation ||
      swapIsLoading ||
      (getStateMessage() === 'Loading' &&
        (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT)) ||
      (inputRef === inputTarget.TO && addBlur) ||
      (getStateMessage() === 'Loading' &&
        (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
    )
  }, [inputRef, addBlur, lockAnimation, swapIsLoading, getStateMessage])

  const [errorVisible, setErrorVisible] = useState(false)

  useEffect(() => {
    const hasUnknown =
      tokens[tokenFromIndex ?? '']?.isUnknown || tokens[tokenToIndex ?? '']?.isUnknown

    const riskWarning =
      (priceImpact > 5 || oraclePriceDiffPercentage >= 10) &&
      !priceToLoading &&
      !priceFromLoading &&
      !showBlur

    if (hasUnknown) {
      setErrorVisible(true)
      return
    }
    const id = setTimeout(() => setErrorVisible(riskWarning), 150)
    return () => clearTimeout(id)
  }, [
    priceImpact,
    oraclePriceDiffPercentage,
    priceFromLoading,
    priceToLoading,
    showBlur,
    tokens,
    tokenFromIndex,
    tokenToIndex
  ])

  const unknownFrom = tokens[tokenFromIndex ?? '']?.isUnknown
  const unknownTo = tokens[tokenToIndex ?? '']?.isUnknown
  const isUnkown = unknownFrom || unknownTo
  const showOracle = oraclePriceDiffPercentage >= 10 && errorVisible
  const showImpact = priceImpact > 5 && oraclePriceDiffPercentage < 10 && errorVisible

  const warningsCount = [showOracle, showImpact, isUnkown].filter(Boolean).length

  const revertTokens = () => {
    setIsReversingTokens(true)
    if (lockAnimation) return
    setRateLoading(true)
    setLockAnimation(!lockAnimation)
    setRotates(rotates + 1)
    swap !== null ? setSwap(!swap) : setSwap(true)
    setTimeout(() => {
      const tmpAmount = amountTo

      const tmp = tokenFromIndex
      setTokenFromIndex(tokenToIndex)
      setTokenToIndex(tmp)

      setInputRef(inputTarget.FROM)
      setAmountFrom(tmpAmount)
    }, 10)
  }

  const feeTiers = ALL_FEE_TIERS_DATA.map(tier => +printBN(tier.tier.fee, DECIMAL - 2))
  return (
    <Grid className={classes.wrapper}>
      <Grid className={classes.upperContainer}>
        <Chart
          tokenFrom={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
          tokenTo={tokenToIndex !== null ? tokens[tokenToIndex] : null}
          tokens={tokens}
          disabledFeeTiers={[]}
          selectedFee={selectedFee}
          feeTiers={feeTiers}
          poolsList={poolsList}
          interval={lastUsedInterval ?? IntervalsKeys.Daily}
          isDisabled={false}
          isLoading={false}
          noData={false}
          selectFeeTier={selectFeeTier}
          xToY={true}
          updateInterval={updateInterval}
          setXToY={revertTokens}
          chartPoolData={chartPoolData}
        />

        <Grid className={classes.swapWrapper}>
          <Grid container className={classes.header}>
            <Box className={classes.leftSection}>
              <Typography component='h1'>Swap tokens</Typography>
            </Box>

            <Box className={classes.rightSection}>
              <Button className={classes.slippageButton} onClick={e => handleClickSettings(e)}>
                <p>
                  Slippage: <span className={classes.slippageAmount}>{slippTolerance}%</span>
                </p>
              </Button>

              <Box className={classes.swapControls}>
                <TooltipHover title='Refresh'>
                  <Grid className={classes.refreshIconContainer}>
                    <Button
                      onClick={handleRefresh}
                      className={classes.refreshIconBtn}
                      disabled={
                        priceFromLoading ||
                        priceToLoading ||
                        isBalanceLoading ||
                        getStateMessage() === 'Loading' ||
                        tokenFromIndex === null ||
                        tokenToIndex === null ||
                        tokenFromIndex === tokenToIndex
                      }>
                      <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                    </Button>
                  </Grid>
                </TooltipHover>
                <TooltipHover title='Settings'>
                  <Button onClick={handleClickSettings} className={classes.settingsIconBtn}>
                    <img src={settingIcon} className={classes.settingsIcon} alt='Settings' />
                  </Button>
                </TooltipHover>
              </Box>
            </Box>

            <Grid className={classes.slippage}>
              <Slippage
                open={settings}
                setSlippage={setSlippage}
                handleClose={handleCloseSettings}
                anchorEl={anchorEl}
                initialSlippage={initialSlippage}
              />
            </Grid>
          </Grid>
          <Collapse in={wrappedETHAccountExist} className={classes.collapseWrapper}>
            <Grid className={classes.unwrapContainer}>
              {shortenText
                ? `You have ${!shortenTextXS ? 'wrapped' : ''} ${formatNumberWithoutSuffix(printBN(wrappedETHBalance, WETH_MAIN.decimals))} ${shortenTextXS ? 'W' : ''}ETH`
                : `          You currently hold ${formatNumberWithoutSuffix(printBN(wrappedETHBalance, WETH_MAIN.decimals))} wrapped Ether in your
            wallet`}
              <span className={classes.unwrapNowButton} onClick={unwrapWETH}>
                Unwrap now
              </span>
            </Grid>
          </Collapse>
          <Grid container className={classes.borderContainer}>
            <Grid container className={classes.root} direction='column'>
              <Typography className={classes.swapLabel}>Pay</Typography>
              <Box
                className={cx(
                  classes.exchangeRoot,
                  lockAnimation ? classes.amountInputDown : undefined
                )}>
                <ExchangeAmountInput
                  value={amountFrom}
                  balance={
                    tokenFromIndex !== null && !!tokens[tokenFromIndex]
                      ? printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals)
                      : '- -'
                  }
                  decimal={
                    tokenFromIndex !== null
                      ? tokens[tokenFromIndex].decimals
                      : DEFAULT_TOKEN_DECIMAL
                  }
                  className={classes.amountInput}
                  setValue={value => {
                    if (value.match(/^\d*\.?\d*$/)) {
                      setAmountFrom(value)
                      setInputRef(inputTarget.FROM)
                    }
                  }}
                  placeholder={`0.${'0'.repeat(6)}`}
                  actionButtons={[
                    {
                      label: 'Max',
                      variant: 'max',
                      onClick: () => {
                        actions.max(tokenFromIndex)
                      }
                    },
                    {
                      label: '50%',
                      variant: 'half',
                      onClick: () => {
                        actions.half(tokenFromIndex)
                      }
                    }
                  ]}
                  tokens={tokens}
                  current={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
                  onSelect={setTokenFromIndex}
                  disabled={tokenFromIndex === tokenToIndex || tokenFromIndex === null}
                  hideBalances={walletStatus !== Status.Initialized}
                  handleAddToken={handleAddToken}
                  commonTokens={commonTokens}
                  limit={1e14}
                  initialHideUnknownTokensValue={initialHideUnknownTokensValue}
                  onHideUnknownTokensChange={e => {
                    onHideUnknownTokensChange(e)
                    setHideUnknownTokens(e)
                  }}
                  tokenPrice={tokenFromPriceData?.price}
                  priceLoading={priceFromLoading}
                  isBalanceLoading={isBalanceLoading}
                  showMaxButton={true}
                  showBlur={
                    amountTo === '' && amountFrom === ''
                      ? false
                      : (inputRef === inputTarget.TO && addBlur) ||
                        lockAnimation ||
                        (getStateMessage() === 'Loading' &&
                          (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
                  }
                  hiddenUnknownTokens={hideUnknownTokens}
                  network={network}
                />
              </Box>

              <Box className={classes.tokenComponentTextContainer}>
                <Box className={classes.swapArrowBox} onClick={revertTokens}>
                  <Box className={classes.swapImgRoot}>
                    <img
                      src={swapArrowsIcon}
                      style={{
                        transform: `rotate(${-rotates * 180}deg)`
                      }}
                      className={classes.swapArrows}
                      alt='Invert tokens'
                    />
                  </Box>
                </Box>
              </Box>
              <Typography className={classes.swapLabel} mt={1.5}>
                Receive
              </Typography>
              <Box
                className={cx(
                  classes.exchangeRoot,
                  classes.transactionBottom,
                  lockAnimation ? classes.amountInputUp : undefined
                )}>
                <ExchangeAmountInput
                  value={amountTo}
                  balance={
                    tokenToIndex !== null
                      ? printBN(tokens[tokenToIndex].balance, tokens[tokenToIndex].decimals)
                      : '- -'
                  }
                  className={classes.amountInput}
                  decimal={
                    tokenToIndex !== null ? tokens[tokenToIndex].decimals : DEFAULT_TOKEN_DECIMAL
                  }
                  setValue={value => {
                    if (value.match(/^\d*\.?\d*$/)) {
                      setAmountTo(value)
                      setInputRef(inputTarget.TO)
                    }
                  }}
                  placeholder={`0.${'0'.repeat(6)}`}
                  actionButtons={[
                    {
                      label: 'Max',
                      variant: 'max',
                      onClick: () => {
                        actions.max(tokenFromIndex)
                      }
                    },
                    {
                      label: '50%',
                      variant: 'half',
                      onClick: () => {
                        actions.half(tokenFromIndex)
                      }
                    }
                  ]}
                  tokens={tokens}
                  current={tokenToIndex !== null ? tokens[tokenToIndex] : null}
                  onSelect={setTokenToIndex}
                  disabled={tokenFromIndex === tokenToIndex || tokenToIndex === null}
                  hideBalances={walletStatus !== Status.Initialized}
                  handleAddToken={handleAddToken}
                  commonTokens={commonTokens}
                  limit={1e14}
                  initialHideUnknownTokensValue={initialHideUnknownTokensValue}
                  onHideUnknownTokensChange={e => {
                    onHideUnknownTokensChange(e)
                    setHideUnknownTokens(e)
                  }}
                  tokenPrice={tokenToPriceData?.price}
                  showMaxButton={false}
                  priceLoading={priceToLoading}
                  isBalanceLoading={isBalanceLoading}
                  showBlur={
                    amountTo === '' && amountFrom === ''
                      ? false
                      : (inputRef === inputTarget.FROM && addBlur) ||
                        lockAnimation ||
                        (getStateMessage() === 'Loading' &&
                          (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT))
                  }
                  hiddenUnknownTokens={hideUnknownTokens}
                  network={network}
                />
              </Box>
              <Box
                className={classes.unknownWarningContainer}
                style={{
                  height: errorVisible
                    ? `${warningsCount === 1 ? 34 : warningsCount * 34 + warningsCount * 4}px`
                    : '0px'
                }}>
                {oraclePriceDiffPercentage >= 10 && errorVisible && (
                  <TooltipHover
                    title='This swap price my differ from market price'
                    top={100}
                    fullSpan>
                    <Box className={classes.unknownWarning}>
                      Potential loss {!txDown2 && 'resulting'} from a{' '}
                      {oraclePriceDiffPercentage.toFixed(2)}% price difference.
                    </Box>
                  </TooltipHover>
                )}
                {priceImpact > 5 && oraclePriceDiffPercentage < 10 && errorVisible && (
                  <TooltipHover title='Your trade size might be too large' top={100} fullSpan>
                    <Box className={classes.unknownWarning}>
                      High price impact:{' '}
                      {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}!
                      {!txDown && ' This swap will cause a significant price movement.'}
                    </Box>
                  </TooltipHover>
                )}
                <Grid className={classes.unverfiedWrapper}>
                  {tokens[tokenFromIndex ?? '']?.isUnknown && (
                    <TooltipHover
                      title={`${tokens[tokenFromIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}
                      top={100}
                      fullSpan>
                      <Box className={classes.unknownWarning}>
                        <img width={16} src={warningIcon} />
                        {tokens[tokenFromIndex ?? ''].symbol} is not verified
                      </Box>
                    </TooltipHover>
                  )}
                  {tokens[tokenToIndex ?? '']?.isUnknown && (
                    <TooltipHover
                      title={`${tokens[tokenToIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}
                      top={100}
                      fullSpan>
                      <Box className={classes.unknownWarning}>
                        <img width={16} src={warningIcon} />
                        {tokens[tokenToIndex ?? ''].symbol} is not verified
                      </Box>
                    </TooltipHover>
                  )}
                </Grid>
              </Box>
              <Box className={classes.mobileChangeWrapper}>
                <Box className={classes.transactionDetails}>
                  <Box className={classes.mobileChangeRatioWrapper}>
                    <Box className={classes.transactionDetailsInner}>
                      <button
                        onClick={
                          tokenFromIndex !== null &&
                          tokenToIndex !== null &&
                          hasShowRateMessage() &&
                          amountFrom !== '' &&
                          amountTo !== ''
                            ? handleOpenTransactionDetails
                            : undefined
                        }
                        className={cx(
                          tokenFromIndex !== null &&
                            tokenToIndex !== null &&
                            hasShowRateMessage() &&
                            amountFrom !== '' &&
                            amountTo !== ''
                            ? classes.HiddenTransactionButton
                            : classes.transactionDetailDisabled,
                          classes.transactionDetailsButton
                        )}>
                        <Grid className={classes.transactionDetailsWrapper}>
                          <Typography className={classes.transactionDetailsHeader}>
                            {detailsOpen && canShowDetails ? 'Hide' : 'Show'} transaction details
                          </Typography>
                        </Grid>
                      </button>
                      {tokenFromIndex !== null &&
                        tokenToIndex !== null &&
                        tokenFromIndex !== tokenToIndex && (
                          <TooltipHover title='Refresh'>
                            <Grid container className={classes.tooltipRefresh}>
                              <Refresher
                                currentIndex={refresherTime}
                                maxIndex={REFRESHER_INTERVAL}
                                onClick={handleRefresh}
                              />
                            </Grid>
                          </TooltipHover>
                        )}
                    </Box>
                    {canShowDetails ? (
                      <Box className={classes.exchangeRateWrapper}>
                        <ExchangeRate
                          onClick={() => setRateReversed(!rateReversed)}
                          tokenFromSymbol={
                            tokens[rateReversed ? tokenToIndex : tokenFromIndex].symbol
                          }
                          tokenToSymbol={
                            tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol
                          }
                          amount={rateReversed ? 1 / swapRate : swapRate}
                          tokenToDecimals={
                            tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals
                          }
                          loading={getStateMessage() === 'Loading' || rateLoading || addBlur}
                        />
                      </Box>
                    ) : null}
                  </Box>
                  <TransactionDetailsBox
                    open={detailsOpen && canShowDetails}
                    exchangeRate={{
                      val: rateReversed ? 1 / swapRate : swapRate,
                      symbol: canShowDetails
                        ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol
                        : '',
                      decimal: canShowDetails
                        ? tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals
                        : 0
                    }}
                    slippage={+slippTolerance}
                    priceImpact={priceImpact}
                    isLoadingRate={getStateMessage() === 'Loading' || addBlur}
                    simulationPath={simulationPath}
                  />
                  <TokensInfo
                    tokenFrom={tokenFromIndex !== null ? tokens[tokenFromIndex] : null}
                    tokenTo={tokenToIndex !== null ? tokens[tokenToIndex] : null}
                    tokenToPrice={tokenToPriceData?.price}
                    tokenFromPrice={tokenFromPriceData?.price}
                    copyTokenAddressHandler={copyTokenAddressHandler}
                    network={network}
                  />
                </Box>
                {walletStatus !== Status.Initialized && getStateMessage() !== 'Loading' ? (
                  <ChangeWalletButton
                    height={48}
                    name='Connect wallet'
                    onConnect={onConnectWallet}
                    connected={false}
                    onDisconnect={onDisconnectWallet}
                    isSwap={true}
                  />
                ) : getStateMessage() === 'Insufficient ETH' ? (
                  <TooltipHover
                    title='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
                    top={-45}>
                    <AnimatedButton
                      content={getStateMessage()}
                      className={
                        getStateMessage() === 'Connect a wallet'
                          ? `${classes.swapButton}`
                          : getStateMessage() === 'Exchange' && progress === 'none'
                            ? `${classes.swapButton} ${classes.ButtonSwapActive}`
                            : classes.swapButton
                      }
                      disabled={getStateMessage() !== 'Exchange' || progress !== 'none'}
                      onClick={() => {
                        if (tokenFromIndex === null || tokenToIndex === null) return

                        onSwap(
                          fromFee(new BN(Number(+slippTolerance * 1000))),
                          simulateResult.estimatedPriceAfterSwap,
                          simulationPath.tokenFrom?.assetAddress ?? PublicKey.default,
                          simulationPath.tokenBetween?.assetAddress ?? null,
                          simulationPath.tokenTo?.assetAddress ?? PublicKey.default,
                          simulationPath.firstPair,
                          simulationPath.secondPair,
                          convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                          convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                          inputRef === inputTarget.FROM
                        )
                      }}
                      progress={progress}
                    />
                  </TooltipHover>
                ) : (
                  <AnimatedButton
                    content={getStateMessage()}
                    className={
                      getStateMessage() === 'Connect a wallet'
                        ? `${classes.swapButton}`
                        : getStateMessage() === 'Exchange' && progress === 'none'
                          ? `${classes.swapButton} ${classes.ButtonSwapActive}`
                          : classes.swapButton
                    }
                    disabled={getStateMessage() !== 'Exchange' || progress !== 'none'}
                    onClick={() => {
                      if (tokenFromIndex === null || tokenToIndex === null) return

                      onSwap(
                        // fromFee(new BN(Number(+slippTolerance * 1000))),
                        // simulateResult.estimatedPriceAfterSwap,
                        // tokens[tokenFromIndex].assetAddress,
                        // tokens[tokenToIndex].assetAddress,
                        // simulateResult.poolIndex,
                        // convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                        // convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                        // inputRef === inputTarget.FROM
                        fromFee(new BN(Number(+slippTolerance * 1000))),
                        simulateResult.estimatedPriceAfterSwap,
                        simulationPath.tokenFrom?.assetAddress ?? PublicKey.default,
                        simulationPath.tokenBetween?.assetAddress ?? null,
                        simulationPath.tokenTo?.assetAddress ?? PublicKey.default,
                        simulationPath.firstPair,
                        simulationPath.secondPair,
                        convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                        convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                        inputRef === inputTarget.FROM
                      )
                    }}
                    progress={progress}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <img
        src={auditIcon}
        alt='Audit'
        style={{ marginTop: '24px', marginInline: 'auto' }}
        width={180}
      />
    </Grid>
  )
}

export default Swap
