import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@common/Refresher/Refresher'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Grid, Typography } from '@mui/material'
import {
  DEFAULT_TOKEN_DECIMAL,
  NetworkType,
  REFRESHER_INTERVAL,
  SwapType,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN,
  WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST,
  WRAPPED_ETH_ADDRESS
} from '@store/consts/static'
import {
  addressToTicker,
  calculatePoints,
  convertBalanceToBN,
  findPairs,
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
import { auditIcon, refreshIcon, settingIcon, swapArrowsIcon } from '@static/icons'
import SwapPointsPopover from '@components/Modals/SwapPointsPopover/SwapPointsPopover'
import AnimatedWaves from './AnimatedWaves/AnimatedWaves'
import { EstimatedPointsLabel } from './EstimatedPointsLabel/EstimatedPointsLabel'
import { useNavigate } from 'react-router-dom'
import { FetcherRecords, Pair, SimulationTwoHopResult } from '@invariant-labs/sdk-eclipse'

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
  pointsPerUsdFee: number
  feeds: Record<
    string,
    {
      pricePublishTime: number
      priceDecimals: number
      price: string
    }
  >
  promotedSwapPairs: { tokenX: string; tokenY: string }[]
  swapMultiplier: string
  market: Market
  tokensDict: Record<string, SwapToken>
  swapAccounts: FetcherRecords
  swapIsLoading: boolean
  setAmountFrom: (amount: string, isUser?: boolean) => void
  setAmountTo: (amount: string, isUser?: boolean) => void
  amountFrom: string
  amountTo: string
  lastEdited: string | null
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
  isTimeoutError,
  deleteTimeoutError,
  canNavigate,
  pointsPerUsdFee,
  feeds,
  promotedSwapPairs,
  swapMultiplier,
  market,
  tokensDict,
  swapAccounts,
  swapIsLoading,
  setAmountFrom,
  setAmountTo,
  amountFrom,
  amountTo,
  lastEdited
}) => {
  const { classes, cx } = useStyles()
  enum inputTarget {
    DEFAULT = 'default',
    FROM = 'from',
    TO = 'to'
  }

  const [tokenFromIndex, setTokenFromIndex] = React.useState<number | null>(null)
  const [tokenToIndex, setTokenToIndex] = React.useState<number | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [lockAnimation, setLockAnimation] = React.useState<boolean>(false)
  const [swap, setSwap] = React.useState<boolean | null>(null)
  const [rotates, setRotates] = React.useState<number>(0)
  const [slippTolerance, setSlippTolerance] = React.useState<string>(initialSlippage)
  const [throttle, setThrottle] = React.useState<boolean>(false)
  const [settings, setSettings] = React.useState<boolean>(false)
  const [detailsOpen, setDetailsOpen] = React.useState<boolean>(false)
  const [inputRef, setInputRef] = React.useState<string>(inputTarget.DEFAULT)
  const [isFirstPairGivingPoints, setIsFirstPairGivingPoints] = React.useState<boolean>(false)
  const [isSecondPairGivingPoints, setIsSecondPairGivingPoints] = React.useState<boolean>(false)
  const [rateReversed, setRateReversed] = React.useState<boolean>(
    tokenFromIndex && tokenToIndex
      ? !initialXtoY(
          tokens[tokenFromIndex].assetAddress.toString(),
          tokens[tokenToIndex].assetAddress.toString()
        )
      : false
  )
  const [pendingSimulation, setPendingSimulation] = useState(false)
  const [rateLoading, setRateLoading] = React.useState<boolean>(false)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )
  const [pointsForSwap, setPointsForSwap] = React.useState<BN | null>(null)
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
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

  useEffect(() => {
    if (lastEdited && tokenFromIndex !== null && tokenToIndex !== null) {
      setInputRef(lastEdited === 'from' ? inputTarget.FROM : inputTarget.TO)
    }
  }, [lastEdited, tokenFromIndex, tokenToIndex])
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

    if (swapType === SwapType.WithHop) {
      const isFirstPoints = promotedSwapPairs.some(
        item =>
          (new PublicKey(item.tokenX).equals(
            simulationPath.tokenFrom?.assetAddress ?? new PublicKey('')
          ) &&
            new PublicKey(item.tokenY).equals(
              simulationPath.tokenBetween?.assetAddress ?? new PublicKey('')
            )) ||
          (new PublicKey(item.tokenX).equals(
            simulationPath.tokenBetween?.assetAddress ?? new PublicKey('')
          ) &&
            new PublicKey(item.tokenY).equals(
              simulationPath.tokenFrom?.assetAddress ?? new PublicKey('')
            ))
      )
      const isSecondPoints = promotedSwapPairs.some(
        item =>
          (new PublicKey(item.tokenX).equals(
            simulationPath.tokenBetween?.assetAddress ?? new PublicKey('')
          ) &&
            new PublicKey(item.tokenY).equals(
              simulationPath.tokenTo?.assetAddress ?? new PublicKey('')
            )) ||
          (new PublicKey(item.tokenX).equals(
            simulationPath.tokenTo?.assetAddress ?? new PublicKey('')
          ) &&
            new PublicKey(item.tokenY).equals(
              simulationPath.tokenBetween?.assetAddress ?? new PublicKey('')
            ))
      )
      setIsFirstPairGivingPoints(isFirstPoints)
      setIsSecondPairGivingPoints(isSecondPoints)
    } else {
      const isPoints = promotedSwapPairs.some(
        item =>
          (new PublicKey(item.tokenX).equals(tokens[tokenToIndex].assetAddress) &&
            new PublicKey(item.tokenY).equals(tokens[tokenFromIndex].assetAddress)) ||
          (new PublicKey(item.tokenX).equals(tokens[tokenFromIndex].assetAddress) &&
            new PublicKey(item.tokenY).equals(tokens[tokenToIndex].assetAddress))
      )
      setIsFirstPairGivingPoints(isPoints)
      setIsSecondPairGivingPoints(false)
    }

    setPointsForSwap(null)

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
    promotedSwapPairs,
    simulationPath.tokenFrom,
    simulationPath.tokenBetween,
    simulationPath.tokenTo
  ])

  useEffect(() => {
    if (simulateResult && (isFirstPairGivingPoints || isSecondPairGivingPoints)) {
      const pointsPerUSD = new BN(pointsPerUsdFee, 'hex')

      if (swapType === SwapType.WithHop) {
        const firstFeed = feeds[simulationPath.tokenFrom?.assetAddress.toString() ?? '']
        const secondFeed = feeds[simulationPath.tokenBetween?.assetAddress.toString() ?? '']

        const firstPoints = isFirstPairGivingPoints
          ? calculatePoints(
              simulationPath.firstAmount ?? new BN(0),
              simulationPath.tokenFrom?.decimals ?? 0,
              simulationPath.firstPair.feeTier.fee ?? new BN(0),
              firstFeed?.price ?? '0',
              firstFeed?.priceDecimals ?? 0,
              pointsPerUSD
            )
          : new BN(0)
        const secondPoints = isSecondPairGivingPoints
          ? calculatePoints(
              simulationPath.secondAmount ?? new BN(0),
              simulationPath.tokenBetween?.decimals ?? 0,
              simulationPath.secondPair.feeTier.fee ?? new BN(0),
              secondFeed?.price ?? '0',
              secondFeed?.priceDecimals ?? 0,
              pointsPerUSD
            )
          : new BN(0)
        setPointsForSwap(firstPoints.add(secondPoints))
      } else {
        const feePercentage = pools[simulateResult.poolIndex ?? 0]?.fee ?? new BN(0)
        let desiredAmount: string
        let desiredIndex: number | null
        if (inputRef === inputTarget.FROM) {
          desiredIndex = tokenFromIndex
          desiredAmount = amountFrom
        } else {
          desiredIndex = tokenToIndex
          desiredAmount = amountTo
        }
        const feed = feeds[tokens[desiredIndex!].assetAddress.toString()]
        const amount = convertBalanceToBN(desiredAmount, tokens[desiredIndex!].decimals)

        if (!feed || !feed.price || simulateResult.amountOut.eqn(0)) {
          setPointsForSwap(new BN(0))
          return
        }

        const points = calculatePoints(
          amount,
          tokens[desiredIndex!].decimals,
          feePercentage,
          feed.price,
          feed.priceDecimals,
          pointsPerUSD
        )
        setPointsForSwap(points)
      }
    } else {
      setPointsForSwap(new BN(0))
    }
  }, [simulateResult, simulateWithHopResult, isFirstPairGivingPoints, isSecondPairGivingPoints])

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
      !(amountFrom === '' && amountTo === '') &&
      !swapIsLoading &&
      swapAccounts &&
      Object.keys(swapAccounts.pools || {}).length > 0
    ) {
      simulateWithTimeout()
    }
  }, [
    amountFrom,
    inputRef,
    isReversingTokens,
    swapIsLoading,
    swapAccounts,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (
      inputRef === inputTarget.TO &&
      !isReversingTokens &&
      !(amountFrom === '' && amountTo === '') &&
      !swapIsLoading &&
      swapAccounts &&
      Object.keys(swapAccounts.pools || {}).length > 0
    ) {
      simulateWithTimeout()
    }
  }, [
    amountTo,
    inputRef,
    isReversingTokens,
    swapIsLoading,
    swapAccounts,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (progress === 'none' && !(amountFrom === '' && amountTo === '')) {
      if (swapIsLoading) {
        setPendingSimulation(true)
      } else {
        if (swapAccounts && Object.keys(swapAccounts.pools || {}).length > 0) {
          simulateWithTimeout()
        }
      }
    }
  }, [progress, swapIsLoading])

  const simulateWithTimeout = () => {
    if (pendingSimulation || swapIsLoading) {
      return
    }

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
    if (!swapIsLoading && pendingSimulation) {
      setPendingSimulation(false)
      simulateWithTimeout()
    }
  }, [swapIsLoading, pendingSimulation])

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

    if (!pendingSimulation && !swapIsLoading) {
      setAddBlur(false)
    }
  }, [bestAmount, simulateResult, simulateWithHopResult, pendingSimulation, swapIsLoading])

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
    if (swapIsLoading) {
      setPendingSimulation(true)
      if (!addBlur) {
        setAddBlur(true)
      }
      return
    }

    if (addBlur && !pendingSimulation) {
      return
    }

    if (!addBlur) {
      setAddBlur(true)
    }

    if (isSimulationRunning) {
      return
    }

    if (tokenFromIndex !== null && tokenToIndex !== null && !swapIsLoading) {
      if (!swapAccounts || Object.keys(swapAccounts.pools || {}).length === 0) {
        return
      }

      try {
        if (inputRef === inputTarget.FROM) {
          setIsSimulationRunning(true)
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
          setIsSimulationRunning(false)
        } else if (inputRef === inputTarget.TO) {
          setIsSimulationRunning(true)
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
          setIsSimulationRunning(false)
        }
      } catch (error) {
        console.error('Simulation failed:', error)
      }
    }

    if (!pendingSimulation && !swapIsLoading) {
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
          : simulateWithHopResult.simulation.swapHopOne.accumulatedAmountIn
              .add(simulateWithHopResult.simulation.swapHopOne.accumulatedFee)
              .toString()
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
    if (
      bestAmount.gt(new BN(0)) &&
      tokenFromIndex !== null &&
      tokenToIndex !== null &&
      inputRef === inputTarget.FROM
    ) {
      const amount = getAmountOut(tokens[tokenToIndex])
      setAmountTo(trimLeadingZeros(amount))
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
      (tokenFromIndex !== null && tokenToIndex !== null && throttle) ||
      isWaitingForNewPool ||
      swapIsLoading ||
      isReversingTokens ||
      isError("TypeError: Cannot read properties of undefined (reading 'bitmap')")
    ) {
      return 'Loading'
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

    if (addBlur) {
      return 'Loading'
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
      setWasIsFetchingNewPoolRun(false)
      setWasSwapIsLoadingRun(false)
      if (isReversingTokens) {
        setIsReversingTokens(false)
      }

      void setSimulateAmount()
    }
  }, [wasIsFetchingNewPoolRun, wasSwapIsLoadingRun, isFetchingNewPool, swapIsLoading])

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (tokenFromIndex === null || tokenToIndex === null) return

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

  const stringPointsValue = useMemo(() => printBN(pointsForSwap, 8), [pointsForSwap])
  const { decimalIndex, isLessThanOne } = useMemo(() => {
    const dotIndex = stringPointsValue.indexOf('.')
    let decimalIndex
    if (dotIndex === -1) {
      decimalIndex = 2
    } else {
      for (let i = dotIndex + 1; i < stringPointsValue.length; i++) {
        if (stringPointsValue[i] !== '0') {
          decimalIndex = i - dotIndex
          break
        }
      }
    }

    const isLessThanOne = Number(stringPointsValue) < 1
    return { decimalIndex, isLessThanOne }
  }, [stringPointsValue])

  const isAnyBlurShowed =
    lockAnimation ||
    (getStateMessage() === 'Loading' &&
      (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT)) ||
    lockAnimation ||
    (getStateMessage() === 'Loading' &&
      (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT)) ||
    pointsForSwap === null

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
      pendingSimulation ||
      swapIsLoading ||
      (getStateMessage() === 'Loading' &&
        (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT)) ||
      (inputRef === inputTarget.TO && addBlur) ||
      (getStateMessage() === 'Loading' &&
        (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
    )
  }, [inputRef, addBlur, lockAnimation, pendingSimulation, swapIsLoading, getStateMessage])

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
  const hasUnknown = unknownFrom || unknownTo
  const showOracle = oraclePriceDiffPercentage >= 10 && errorVisible
  const showImpact = priceImpact > 5 && oraclePriceDiffPercentage < 10 && errorVisible

  const warningsCount = [showOracle, showImpact, hasUnknown].filter(Boolean).length

  return (
    <Grid container className={classes.swapWrapper} alignItems='center'>
      {wrappedETHAccountExist && (
        <Box className={classes.unwrapContainer}>
          You have wrapped ETH.{' '}
          <u className={classes.unwrapNowButton} onClick={unwrapWETH}>
            Unwrap now.
          </u>
        </Box>
      )}

      <Grid container className={classes.header}>
        <Box className={classes.leftSection}>
          <Typography component='h1'>Swap tokens</Typography>
          {network === NetworkType.Mainnet ? (
            <SwapPointsPopover
              isPairGivingPoints={isFirstPairGivingPoints || isSecondPairGivingPoints}
              network={network}
              promotedSwapPairs={promotedSwapPairs}>
              <div>
                <EstimatedPointsLabel
                  isAnimating={isFirstPairGivingPoints || isSecondPairGivingPoints}
                  decimalIndex={decimalIndex}
                  pointsForSwap={pointsForSwap}
                  swapMultiplier={swapMultiplier}
                  isLessThanOne={isLessThanOne}
                  stringPointsValue={stringPointsValue}
                  isAnyBlurShowed={isAnyBlurShowed}
                />
              </div>
            </SwapPointsPopover>
          ) : null}
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

      <Box
        className={cx(
          classes.borderContainer,
          (isFirstPairGivingPoints || isSecondPairGivingPoints) &&
            classes.gradientBorderForContainer
        )}>
        <Grid container className={classes.root} direction='column'>
          <AnimatedWaves
            wavePosition={'top'}
            isAnimating={isFirstPairGivingPoints || isSecondPairGivingPoints}
          />
          <Typography
            className={cx(
              classes.swapLabel,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.textShadowLabel
            )}>
            Pay
          </Typography>
          <Box
            className={cx(
              classes.exchangeRoot,
              lockAnimation ? classes.amountInputDown : undefined,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.darkBackground
            )}>
            <ExchangeAmountInput
              value={amountFrom}
              balance={
                tokenFromIndex !== null && !!tokens[tokenFromIndex]
                  ? printBN(tokens[tokenFromIndex].balance, tokens[tokenFromIndex].decimals)
                  : '- -'
              }
              decimal={
                tokenFromIndex !== null ? tokens[tokenFromIndex].decimals : DEFAULT_TOKEN_DECIMAL
              }
              className={classes.amountInput}
              setValue={value => {
                if (value.match(/^\d*\.?\d*$/)) {
                  setAmountFrom(value, true)
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
                (inputRef === inputTarget.TO && addBlur) ||
                lockAnimation ||
                (pendingSimulation && inputRef !== inputTarget.FROM) ||
                (swapIsLoading && inputRef !== inputTarget.FROM) ||
                (getStateMessage() === 'Loading' &&
                  (inputRef === inputTarget.TO || inputRef === inputTarget.DEFAULT))
              }
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
              isPairGivingPoints={isFirstPairGivingPoints || isSecondPairGivingPoints}
            />
          </Box>

          <Box className={classes.tokenComponentTextContainer}>
            <Box
              className={cx(
                classes.swapArrowBox,
                (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.darkBackground
              )}
              onClick={() => {
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
                }, 50)
              }}>
              <Box
                className={cx(
                  classes.swapImgRoot,
                  (isFirstPairGivingPoints || isSecondPairGivingPoints) &&
                    classes.componentBackground
                )}>
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
          <Typography
            className={cx(
              classes.swapLabel,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.textShadowLabel
            )}
            mt={1.5}>
            Receive
          </Typography>
          <Box
            className={cx(
              classes.exchangeRoot,
              classes.transactionBottom,
              lockAnimation ? classes.amountInputUp : undefined,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.darkBackground
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
                  setAmountTo(value, true)
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
              priceLoading={priceToLoading}
              isBalanceLoading={isBalanceLoading}
              showMaxButton={false}
              showBlur={
                (inputRef === inputTarget.FROM && addBlur) ||
                lockAnimation ||
                (pendingSimulation && inputRef !== inputTarget.TO) ||
                (swapIsLoading && inputRef !== inputTarget.TO) ||
                (getStateMessage() === 'Loading' &&
                  (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT))
              }
              hiddenUnknownTokens={hideUnknownTokens}
              network={network}
              isPairGivingPoints={isFirstPairGivingPoints || isSecondPairGivingPoints}
            />
          </Box>
          <Box
            className={classes.unknownWarningContainer}
            style={{
              height: errorVisible ? `${warningsCount === 1 ? 34 : warningsCount * 46}px` : '0px'
            }}>
            {oraclePriceDiffPercentage >= 10 && errorVisible && (
              <TooltipHover title='This swap price my differ from market price' top={100} fullSpan>
                <Box className={classes.unknownWarning}>
                  Potential loss resulting from a {oraclePriceDiffPercentage.toFixed(2)}% price
                  difference.
                </Box>
              </TooltipHover>
            )}
            {priceImpact > 5 && oraclePriceDiffPercentage < 10 && errorVisible && (
              <TooltipHover title='Your trade size might be too large' top={100} fullSpan>
                <Box className={classes.unknownWarning}>
                  High price impact: {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}!
                  This swap will cause a significant price movement.
                </Box>
              </TooltipHover>
            )}
            <Grid width={1} gap={1} display='flex'>
              {tokens[tokenFromIndex ?? '']?.isUnknown && (
                <TooltipHover
                  title={`${tokens[tokenFromIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}
                  top={100}
                  fullSpan>
                  <Box className={classes.unknownWarning}>
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
                  <Box
                    className={cx(
                      classes.exchangeRateWrapper,
                      (isFirstPairGivingPoints || isSecondPairGivingPoints) &&
                        classes.darkBackground
                    )}>
                    <ExchangeRate
                      onClick={() => setRateReversed(!rateReversed)}
                      tokenFromSymbol={tokens[rateReversed ? tokenToIndex : tokenFromIndex].symbol}
                      tokenToSymbol={tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol}
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
                isPairGivingPoints={isFirstPairGivingPoints || isSecondPairGivingPoints}
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
          <AnimatedWaves
            wavePosition={'bottom'}
            isAnimating={isFirstPairGivingPoints || isSecondPairGivingPoints}
          />
        </Grid>
      </Box>
      <img src={auditIcon} alt='Audit' style={{ marginTop: '24px' }} width={180} />
    </Grid>
  )
}

export default Swap
