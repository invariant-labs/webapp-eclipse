import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import ExchangeAmountInput from '@components/Inputs/ExchangeAmountInput/ExchangeAmountInput'
import Slippage from '@components/Modals/Slippage/Slippage'
import Refresher from '@components/Refresher/Refresher'
import { BN } from '@coral-xyz/anchor'
import { Box, Button, Grid, Typography } from '@mui/material'
import refreshIcon from '@static/svg/refresh.svg'
import settingIcon from '@static/svg/settings.svg'
import SwapArrows from '@static/svg/swap-arrows.svg'
import {
  DEFAULT_TOKEN_DECIMAL,
  NetworkType,
  REFRESHER_INTERVAL,
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
  printBN,
  trimLeadingZeros
} from '@utils/utils'
import { Swap as SwapData } from '@store/reducers/swap'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { blurContent, createButtonActions, unblurContent } from '@utils/uiUtils'
import classNames from 'classnames'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ExchangeRate from './ExchangeRate/ExchangeRate'
import TransactionDetailsBox from './TransactionDetailsBox/TransactionDetailsBox'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import TokensInfo from './TokensInfo/TokensInfo'
import { VariantType } from 'notistack'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { DECIMAL, fromFee, SimulationStatus } from '@invariant-labs/sdk-eclipse/lib/utils'
import { PoolWithAddress } from '@store/reducers/pools'
import { PublicKey } from '@solana/web3.js'
import { Tick, Tickmap, Market } from '@invariant-labs/sdk-eclipse/lib/market'
import icons from '@static/icons'
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
    tokenTo: PublicKey,
    poolIndex: number,
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
}

export type SimulationPath = {
  tokenFrom: SwapToken | null
  tokenBetween: SwapToken | null
  tokenTo: SwapToken | null
  firstFee: BN | null
  secondFee: BN | null
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
  swapIsLoading
}) => {
  const { classes } = useStyles()
  enum inputTarget {
    DEFAULT = 'default',
    FROM = 'from',
    TO = 'to'
  }
  enum SwapType {
    NORMAL,
    WITH_HOP
  }
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
  const [isFirstPairGivingPoints, setIsFirstPairGivingPoints] = React.useState<boolean>(false)
  const [isSecondPairGivingPoints, setIsSecondPairGivingPoints] = React.useState<boolean>(false)
  const [rateReversed, setRateReversed] = React.useState<boolean>(false)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)
  const [hideUnknownTokens, setHideUnknownTokens] = React.useState<boolean>(
    initialHideUnknownTokensValue
  )
  const [pointsForSwap, setPointsForSwap] = React.useState<BN>(new BN(0))
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
  const [isPointsPopoverOpen, setIsPointsPopoverOpen] = useState(false)
  const pointsBoxRef = useRef<HTMLDivElement>(null)
  const [simulateWithHopResult, setSimulateWithHopResult] = useState<{
    simulation: SimulationTwoHopResult | null
    route: [Pair, Pair] | null
    error: boolean
  }>({ simulation: null, route: null, error: false })
  const [simulationPath, setSimulationPath] = useState<SimulationPath>({
    tokenFrom: null,
    tokenBetween: null,
    tokenTo: null,
    firstFee: null,
    secondFee: null,
    firstAmount: null,
    secondAmount: null,
    firstPriceImpact: null,
    secondPriceImpact: null
  })
  const [bestAmount, setBestAmount] = useState(new BN(0))
  const [swapType, setSwapType] = useState(SwapType.NORMAL)
  const [addBlur, setAddBlur] = useState(false)

  const handlePointerEnter = () => {
    setIsPointsPopoverOpen(true)
  }
  const handlePointerLeave = () => {
    setIsPointsPopoverOpen(false)
  }

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

  const IS_ERROR_LABEL_SHOW =
    priceImpact > 5 ||
    tokens[tokenFromIndex ?? '']?.isUnknown ||
    tokens[tokenToIndex ?? '']?.isUnknown

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

    if (swapType === SwapType.WITH_HOP) {
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

    setPointsForSwap(new BN(0))

    clearTimeout(urlUpdateTimeoutRef.current)
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const fromTicker = addressToTicker(network, tokens[tokenFromIndex].assetAddress.toString())
      const toTicker = addressToTicker(network, tokens[tokenToIndex].assetAddress.toString())
      const newPath = `/exchange/${fromTicker}/${toTicker}`

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

      if (swapType === SwapType.WITH_HOP) {
        const firstFeed = feeds[simulationPath.tokenFrom?.assetAddress.toString() ?? '']
        const secondFeed = feeds[simulationPath.tokenBetween?.assetAddress.toString() ?? '']

        const firstPoints = calculatePoints(
          simulationPath.firstAmount ?? new BN(0),
          simulationPath.tokenFrom?.decimals ?? 0,
          simulationPath.firstFee ?? new BN(0),
          firstFeed?.price ?? '0',
          firstFeed?.priceDecimals ?? 0,
          pointsPerUSD
        )
        const secondPoints = calculatePoints(
          simulationPath.secondAmount ?? new BN(0),
          simulationPath.tokenBetween?.decimals ?? 0,
          simulationPath.secondFee,
          secondFeed?.price ?? '0',
          secondFeed?.priceDecimals ?? 0,
          pointsPerUSD
        )
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
    if (inputRef === inputTarget.FROM && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [
    amountFrom,
    tokenToIndex,
    tokenFromIndex,
    slippTolerance,
    Object.keys(poolTicks).length,
    Object.keys(tickmap).length
  ])

  useEffect(() => {
    if (inputRef === inputTarget.TO && !(amountFrom === '' && amountTo === '')) {
      simulateWithTimeout()
    }
  }, [
    amountTo,
    tokenToIndex,
    tokenFromIndex,
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
    setRateReversed(false)
  }, [tokenFromIndex, tokenToIndex])

  const getAmountOut = (assetFor: SwapToken) => {
    const amountOut: number = Number(printBN(bestAmount, assetFor.decimals))

    return amountOut.toFixed(assetFor.decimals)
  }

  const setSimulateAmount = async () => {
    if (tokenFromIndex !== null && tokenToIndex !== null) {
      // const pair = findPairs(
      //   tokens[tokenFromIndex].assetAddress,
      //   tokens[tokenToIndex].assetAddress,
      //   pools
      // )[0]
      // if (typeof pair === 'undefined') {
      //   setAmountTo('')
      //   setAddBlur(false)
      //   return
      // }
      // const indexPool = Object.keys(poolTicks).filter(key => {
      //   return key === pair.address.toString()
      // })

      // if (indexPool.length === 0) {
      //   setAmountTo('')
      //   setAddBlur(false)
      //   return
      // }

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
    console.log(
      1,
      simulateResult.amountOut.toString(),
      simulateResult.error,
      '|',
      simulateWithHopResult.simulation?.totalAmountIn.toString(),
      simulateWithHopResult.simulation?.totalAmountOut.toString(),
      simulateWithHopResult.simulation?.swapHopOne.status,
      simulateWithHopResult.simulation?.swapHopOne.status,
      simulateWithHopResult.error
    )
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
      if (simulateWithHopResult?.simulation?.totalAmountOut.gte(simulateResult.amountOut)) {
        useTwoHop = true
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
        firstFee: simulateWithHopResult.route[0].feeTier.fee,
        secondFee: simulateWithHopResult.route[1].feeTier.fee,
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
          ? simulateWithHopResult.simulation?.swapHopTwo.accumulatedAmountOut.toString()
          : simulateWithHopResult.simulation?.swapHopOne.accumulatedAmountIn
              .add(simulateWithHopResult.simulation.swapHopOne.accumulatedFee)
              .toString()
      )
      setSwapType(SwapType.WITH_HOP)
    } else {
      setSimulationPath({
        tokenFrom: tokens[tokenFromIndex ?? 0],
        tokenBetween: null,
        tokenTo: tokens[tokenToIndex ?? 0],
        firstFee: pools[simulateResult.poolIndex]?.fee ?? new BN(0),
        secondFee: null,
        firstAmount: convertBalanceToBN(amountFrom, tokens[tokenFromIndex ?? 0].decimals),
        secondAmount: null,
        firstPriceImpact: simulateResult.priceImpact,
        secondPriceImpact: null
      })
      setBestAmount(simulateResult.amountOut)
      setSwapType(SwapType.NORMAL)
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
    return swapType === SwapType.NORMAL ? simulateResult.error.some(err => err === error) : false
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
      simulateWithHopResult.error
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
      return `Insufficient Wrapped ETH`
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

    if (isEveryPoolEmpty) {
      return 'RPC connection error'
    }

    // Fallback error message
    if (swapType === SwapType.NORMAL && simulateResult.error.length !== 0) {
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
      getStateMessage() === 'Insufficient Wrapped ETH'
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
    onRefresh(tokenFromIndex, tokenToIndex)
    setRefresherTime(REFRESHER_INTERVAL)
  }

  const [wasIsFetchingNewPoolRun, setWasIsFetchingNewPoolRun] = useState(false)
  const [wasSwapIsLoadingRun, setWasSwapIsLoadingRun] = useState(false)

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
      (inputRef === inputTarget.FROM || inputRef === inputTarget.DEFAULT))

  return (
    <Grid container className={classes.swapWrapper} alignItems='center'>
      {network === NetworkType.Mainnet ? (
        <SwapPointsPopover
          isPairGivingPoints={isFirstPairGivingPoints || isSecondPairGivingPoints}
          anchorEl={pointsBoxRef.current}
          open={isPointsPopoverOpen}
          onClose={() => setIsPointsPopoverOpen(false)}
          network={network}
          promotedSwapPairs={promotedSwapPairs}
        />
      ) : null}

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
          <Typography component='h1' style={{ height: '27px' }}>
            Swap tokens
          </Typography>
          {network === NetworkType.Mainnet ? (
            <EstimatedPointsLabel
              isAnimating={isFirstPairGivingPoints || isSecondPairGivingPoints}
              decimalIndex={decimalIndex}
              pointsForSwap={pointsForSwap}
              handlePointerEnter={handlePointerEnter}
              handlePointerLeave={handlePointerLeave}
              pointsBoxRef={pointsBoxRef}
              swapMultiplier={swapMultiplier}
              isLessThanOne={isLessThanOne}
              stringPointsValue={stringPointsValue}
              isAnyBlurShowed={isAnyBlurShowed}
            />
          ) : null}
        </Box>

        <Box className={classes.rightSection}>
          <Button className={classes.slippageButton} onClick={e => handleClickSettings(e)}>
            <p>
              Slippage: <span className={classes.slippageAmount}>{slippTolerance}%</span>
            </p>
          </Button>

          <Box className={classes.swapControls}>
            <TooltipHover text='Refresh'>
              <Grid display='flex' alignItems='center'>
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
            <TooltipHover text='Settings'>
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
        className={classNames(
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
            className={classNames(
              classes.swapLabel,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.textShadowLabel
            )}>
            Pay
          </Typography>
          <Box
            className={classNames(
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
                (inputRef === inputTarget.TO && addBlur) ||
                lockAnimation ||
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
              className={classNames(
                classes.swapArrowBox,
                (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.darkBackground
              )}
              onClick={() => {
                if (lockAnimation) return
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
                className={classNames(
                  classes.swapImgRoot,
                  (isFirstPairGivingPoints || isSecondPairGivingPoints) &&
                    classes.componentBackground
                )}>
                <img
                  src={SwapArrows}
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
            className={classNames(
              classes.swapLabel,
              (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.textShadowLabel
            )}
            mt={1.5}>
            Receive
          </Typography>
          <Box
            className={classNames(
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
              priceLoading={priceToLoading}
              isBalanceLoading={isBalanceLoading}
              showMaxButton={false}
              showBlur={
                (inputRef === inputTarget.FROM && addBlur) ||
                lockAnimation ||
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
            style={{ height: IS_ERROR_LABEL_SHOW ? '34px' : '0px' }}>
            {priceImpact > 5 && (
              <TooltipHover text='Your trade size might be too large'>
                <Box className={classes.unknownWarning}>
                  {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`} Price impact
                </Box>
              </TooltipHover>
            )}
            {tokens[tokenFromIndex ?? '']?.isUnknown && (
              <TooltipHover
                text={`${tokens[tokenFromIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}>
                <Box className={classes.unknownWarning}>
                  {tokens[tokenFromIndex ?? ''].symbol} is not verified
                </Box>
              </TooltipHover>
            )}
            {tokens[tokenToIndex ?? '']?.isUnknown && (
              <TooltipHover
                text={`${tokens[tokenToIndex ?? ''].symbol} is unknown, make sure address is correct before trading`}>
                <Box className={classes.unknownWarning}>
                  {tokens[tokenToIndex ?? ''].symbol} is not verified
                </Box>
              </TooltipHover>
            )}
          </Box>
          <Box className={classes.transactionDetails}>
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
                className={classNames(
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
                  <TooltipHover text='Refresh'>
                    <Grid
                      container
                      alignItems='center'
                      justifyContent='center'
                      width={20}
                      height={34}
                      minWidth='fit-content'
                      ml={1}>
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
                className={classNames(
                  classes.exchangeRateWrapper,
                  (isFirstPairGivingPoints || isSecondPairGivingPoints) && classes.darkBackground
                )}>
                <ExchangeRate
                  onClick={() => setRateReversed(!rateReversed)}
                  tokenFromSymbol={tokens[rateReversed ? tokenToIndex : tokenFromIndex].symbol}
                  tokenToSymbol={tokens[rateReversed ? tokenFromIndex : tokenToIndex].symbol}
                  amount={rateReversed ? 1 / swapRate : swapRate}
                  tokenToDecimals={tokens[rateReversed ? tokenFromIndex : tokenToIndex].decimals}
                  loading={getStateMessage() === 'Loading'}
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
            isLoadingRate={getStateMessage() === 'Loading'}
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
          {walletStatus !== Status.Initialized && getStateMessage() !== 'Loading' ? (
            <ChangeWalletButton
              name='Connect wallet'
              onConnect={onConnectWallet}
              connected={false}
              onDisconnect={onDisconnectWallet}
              className={classes.connectWalletButton}
              isSwap={true}
            />
          ) : getStateMessage() === 'Insufficient Wrapped ETH' ? (
            <TooltipHover
              text='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
              top={-45}>
              <div>
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
                      tokens[tokenFromIndex].assetAddress,
                      tokens[tokenToIndex].assetAddress,
                      simulateResult.poolIndex,
                      convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                      convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                      inputRef === inputTarget.FROM
                    )
                  }}
                  progress={progress}
                />
              </div>
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
                  fromFee(new BN(Number(+slippTolerance * 1000))),
                  simulateResult.estimatedPriceAfterSwap,
                  tokens[tokenFromIndex].assetAddress,
                  tokens[tokenToIndex].assetAddress,
                  simulateResult.poolIndex,
                  convertBalanceToBN(amountFrom, tokens[tokenFromIndex].decimals),
                  convertBalanceToBN(amountTo, tokens[tokenToIndex].decimals),
                  inputRef === inputTarget.FROM
                )
              }}
              progress={progress}
            />
          )}
          <AnimatedWaves
            wavePosition={'bottom'}
            isAnimating={isFirstPairGivingPoints || isSecondPairGivingPoints}
          />
        </Grid>
      </Box>
      <img src={icons.audit} alt='Audit' style={{ marginTop: '24px' }} width={180} />
    </Grid>
  )
}

export default Swap
