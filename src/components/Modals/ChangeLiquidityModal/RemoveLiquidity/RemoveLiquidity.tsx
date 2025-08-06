import AnimatedButton, { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import {
  ALL_FEE_TIERS_DATA,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  NetworkType,
  thresholdsWithTokenDecimal
} from '@store/consts/static'
import { TokenPriceData } from '@store/consts/types'
import {
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  convertBalanceToBN,
  determinePositionTokenBlock,
  formatNumberWithoutSuffix,
  formatNumberWithSuffix,
  getMockedTokenPrice,
  getScaleFromString,
  getThresholdsDecimals,
  getTokenPrice,
  PositionTokenBlock,
  printBN,
  tickerToAddress,
  trimDecimalZeros,
  trimLeadingZeros
} from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { Status } from '@store/reducers/solanaWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import {
  feeToTickSpacing,
  fromFee,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { getMarketAddress, Pair } from '@invariant-labs/sdk-eclipse'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import { Box, Grid, Typography } from '@mui/material'
import { useStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import DepositAmountInput from '@components/Inputs/DepositAmountInput/DepositAmountInput'
import { InputState } from '@components/NewPosition/DepositSelector/DepositSelector'
import { PercentageSlider } from './PercentageSlider/PercentageSlider'
import { unknownTokenIcon } from '@static/icons'

export interface IProps {
  tokenFrom: PublicKey
  tokenTo: PublicKey
  fee: BN
  leftRange: number
  rightRange: number
  tokenXLiquidity: number
  tokenYLiquidity: number
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
  changeLiquidity: (
    liquidity: BN,
    slippage: BN,
    isAddLiquidity: boolean,
    isClosePosition: boolean
  ) => void
  success: boolean
  inProgress: boolean
  setChangeLiquiditySuccess: (value: boolean) => void
  positionLiquidity: BN
}

export const RemoveLiquidity: React.FC<IProps> = ({
  tokenFrom,
  tokenTo,
  fee,
  leftRange,
  rightRange,
  tokenXLiquidity,
  tokenYLiquidity,
  tokens,
  walletStatus,
  allPools,
  isBalanceLoading,
  currentNetwork,
  ticksLoading,
  getCurrentPlotTicks,
  onConnectWallet,
  onDisconnectWallet,
  getPoolData,
  setShouldNotUpdateRange,
  changeLiquidity,
  success,
  inProgress,
  setChangeLiquiditySuccess,
  positionLiquidity
}) => {
  const isLoadingTicksOrTickmap = useMemo(() => ticksLoading, [ticksLoading])
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
    getTokenPrice(addr, currentNetwork)
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
    getTokenPrice(addr, currentNetwork)
      .then(data => setTokenBPriceData({ price: data ?? 0 }))
      .catch(() =>
        setTokenBPriceData(getMockedTokenPrice(tokens[tokenBIndex].symbol, currentNetwork))
      )
      .finally(() => setPriceBLoading(false))
  }, [tokenBIndex, tokens])

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
          amount.add(new BN(1)),
          lowerTick,
          upperTick,
          poolIndex !== null ? allPools[poolIndex].sqrtPrice : midPrice.sqrtPrice,
          false
        )
        return { amount: result.y, liquidity: result.liquidity }
      } else {
        const result = getLiquidityByY(
          amount,
          lowerTick,
          upperTick,
          poolIndex !== null ? allPools[poolIndex].sqrtPrice : midPrice.sqrtPrice,
          false
        )
        return { amount: result.x, liquidity: result.liquidity }
      }
    } catch {
      return { amount: new BN(0), liquidity: new BN(0) }
    }
  }

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [slippTolerance] = React.useState<string>(initialSlippage)

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

  const removeLiquidityHandler = (slippage, isClosePosition) => {
    if (tokenAIndex === null || tokenBIndex === null) {
      return
    }
    if (poolIndex !== null) {
      setShouldNotUpdateRange()
    }
    if (progress === 'none') {
      setProgress('progress')
    }

    changeLiquidity(liquidity, slippage, false, isClosePosition)
  }

  const onRemoveLiquidity = async (isClosePosition = false) => {
    if (tokenAIndex !== null && tokenBIndex !== null) {
      removeLiquidityHandler(fromFee(new BN(Number(+slippTolerance * 1000))), isClosePosition)
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

  const tokenAInputState = {
    value:
      tokenAIndex !== null && tokenBIndex !== null && blockedToken === PositionTokenBlock.A
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
      (tokenAIndex !== null && tokenBIndex !== null && blockedToken === PositionTokenBlock.A) ||
      tokenXLiquidity === 0,
    blockerInfo: 'Range only for single-asset withdraw',
    decimalsLimit: tokenAIndex !== null ? tokens[tokenAIndex].decimals : 0
  } as InputState
  const tokenBInputState = {
    value:
      tokenAIndex !== null && tokenBIndex !== null && blockedToken === PositionTokenBlock.B
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
      (tokenAIndex !== null && tokenBIndex !== null && blockedToken === PositionTokenBlock.B) ||
      tokenYLiquidity === 0,
    blockerInfo: 'Range only for single-asset withdraw',
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
      (!tokenAInputState.blocked && +tokenAInputState.value > tokenXLiquidity) ||
      (!tokenBInputState.blocked && +tokenBInputState.value > tokenYLiquidity)
    ) {
      return `Not enough ${tokens[tokenAIndex].symbol} and ${tokens[tokenBIndex].symbol}`
    }

    if (
      (!tokenAInputState.blocked && +tokenAInputState.value === 0) ||
      (!tokenBInputState.blocked && +tokenBInputState.value === 0)
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

      const [x, y] = isXtoY ? [balanceA, balanceB] : [balanceB, balanceA]
      const [decimalX, decimalY] = isXtoY ? [decimalA, decimalB] : [decimalB, decimalA]

      try {
        const valueX = convertBalanceToBN(
          formatNumberWithSuffix(x, {
            decimalsAfterDot: getThresholdsDecimals(x, thresholdsWithTokenDecimal(xDecimal)),
            noSubNumbers: true,
            noConfig: true
          }),
          xDecimal
        )
          .mul(new BN(depositPercentage))
          .div(new BN(100))

        const valueY = convertBalanceToBN(
          formatNumberWithSuffix(y, {
            decimalsAfterDot: getThresholdsDecimals(y, thresholdsWithTokenDecimal(yDecimal)),
            noSubNumbers: true,
            noConfig: true
          }),
          yDecimal
        )
          .mul(new BN(depositPercentage))
          .div(new BN(100))

        const liquidity = new BN(positionLiquidity).mul(new BN(depositPercentage)).div(new BN(100))

        if (!(x < 0 || y < 0)) {
          setTokenADeposit(
            trimLeadingZeros(isXtoY ? printBN(valueX, decimalX) : printBN(valueY, decimalY))
          )
          setTokenBDeposit(
            trimLeadingZeros(isXtoY ? printBN(valueY, decimalY) : printBN(valueX, decimalX))
          )
          updateLiquidity(liquidity)
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
    depositPercentage,
    positionLiquidity
  ])

  useEffect(() => {
    setIsSlider(false)

    const value = tokenAInputState.blocked
      ? +tokenBDeposit / tokenYLiquidity
      : +tokenADeposit / tokenXLiquidity
    const depositPercentage = Math.round(value * 100)
    setDepositPercentage(isNaN(depositPercentage) ? 0 : depositPercentage)
  }, [tokenADeposit, tokenBDeposit, tokenXLiquidity, tokenYLiquidity])

  const isClosePosition = useMemo(() => {
    if (+tokenAInputState.blocked) {
      return +tokenBDeposit > tokenYLiquidity * 0.99
    }

    if (+tokenBInputState.blocked) {
      return +tokenADeposit > tokenXLiquidity * 0.99
    }

    return +tokenADeposit > tokenXLiquidity * 0.99 && +tokenBDeposit > tokenYLiquidity * 0.99
  }, [
    tokenAInputState.blocked,
    tokenBInputState.blocked,
    tokenBDeposit,
    tokenYLiquidity,
    tokenADeposit,
    tokenXLiquidity
  ])

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
              tokenAIndex !== null ? (tokens[tokenAIndex].isUnknown ?? false) : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  setIsSlider(true)
                  setDepositPercentage(100)
                },
                variant: 'max'
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  setIsSlider(true)
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
            value={tokenAInputState.value}
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
              tokenBIndex !== null ? (tokens[tokenBIndex].isUnknown ?? false) : false
            }
            placeholder='0.0'
            actionButtons={[
              {
                label: 'Max',
                onClick: () => {
                  setIsSlider(true)
                  setDepositPercentage(100)
                },
                variant: 'max'
              },
              {
                label: '50%',
                variant: 'half',
                onClick: () => {
                  setIsSlider(true)
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
            value={tokenBInputState.value}
            priceLoading={priceBLoading}
            isBalanceLoading={isBalanceLoading}
            walletUninitialized={walletStatus !== Status.Initialized}
          />
        </Box>
      </Grid>
      <Box className={classes.statCard}>
        <Box className={classes.statRow}>
          <Typography className={classes.statTitle}>Position after withdraw:</Typography>
          <Typography className={classes.statContent}>
            {tokenAIndex !== null
              ? formatNumberWithoutSuffix(tokenXLiquidity - +tokenAInputState.value)
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
              ? formatNumberWithoutSuffix(tokenYLiquidity - +tokenBInputState.value)
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
          <Typography className={classes.statTitle}>Total withdraw:</Typography>
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
                  if (progress === 'none') {
                    onRemoveLiquidity()
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
                onRemoveLiquidity(isClosePosition)
              }
            }}
            disabled={getButtonMessage() !== 'Remove Liquidity'}
            content={
              getButtonMessage() === 'Remove Liquidity'
                ? isClosePosition
                  ? 'Close Position'
                  : 'Remove Liquidity'
                : getButtonMessage()
            }
            progress={progress}
          />
        )}
      </Box>
    </Grid>
  )
}

export default RemoveLiquidity
