import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { Grid } from '@mui/material'
import {
  autoSwapPools,
  DepositOptions,
  NetworkType,
  PositionTokenBlock,
  promotedTiers,
  REFRESHER_INTERVAL
} from '@store/consts/static'
import {
  calculateConcentration,
  calculateConcentrationRange,
  convertBalanceToBN,
  determinePositionTokenBlock,
  getConcentrationIndex,
  printBN,
  trimLeadingZeros,
  validConcentrationMidPriceTick
} from '@utils/utils'
import { PlotTickData } from '@store/reducers/positions'
import { blurContent } from '@utils/uiUtils'
import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './style'
import { PositionOpeningMethod, TokenPriceData } from '@store/consts/types'
import { Status } from '@store/reducers/solanaWallet'
import { SwapToken } from '@store/selectors/solanaWallet'
import { InitMidPrice } from '@common/PriceRangePlot/PriceRangePlot'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import {
  fromFee,
  getConcentrationArray,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { PoolWithAddress } from '@store/reducers/pools'
import { Tick, Tickmap } from '@invariant-labs/sdk-eclipse/lib/market'
import AddLiquidityDepositSelector from '../AddLiquidityDepositSelector/AddLiquidityDepositSelector'

export interface IAddLiquidityNewPosition {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
  initialConcentration: string
  poolAddress: string
  tokens: SwapToken[]
  data: PlotTickData[]
  midPrice: InitMidPrice
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
  tickSpacing: number
  isWaitingForNewPool: boolean
  poolIndex: number | null
  currentPriceSqrt: BN
  handleAddToken: (address: string) => void
  commonTokens: PublicKey[]
  initialOpeningPositionMethod: PositionOpeningMethod
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  tokenAPriceData?: TokenPriceData
  tokenBPriceData?: TokenPriceData
  priceALoading?: boolean
  priceBLoading?: boolean
  currentFeeIndex: number
  initialSlippage: string
  onRefresh: () => void
  isBalanceLoading: boolean
  isGetLiquidityError: boolean
  network: NetworkType
  ethBalance: BN
  walletStatus: Status
  onConnectWallet: () => void
  onDisconnectWallet: () => void
  canNavigate: boolean
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
  oraclePrice: number | null
  leftRange: number
  rightRange: number
}

export const AddLiquidityNewPosition: React.FC<IAddLiquidityNewPosition> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee,
  initialConcentration,
  poolAddress,
  tokens,
  data,
  midPrice,
  addLiquidityHandler,
  progress = 'progress',
  onChangePositionTokens,
  isCurrentPoolExisting,
  calcAmount,
  updateLiquidity,
  feeTiers,
  isLoadingTicksOrTickmap,
  isXtoY,
  tickSpacing,
  isWaitingForNewPool,
  poolIndex,
  handleAddToken,
  commonTokens,
  initialOpeningPositionMethod,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  tokenAPriceData,
  tokenBPriceData,
  priceALoading,
  priceBLoading,
  currentFeeIndex,
  initialSlippage,
  currentPriceSqrt,
  onRefresh,
  isBalanceLoading,
  isGetLiquidityError,
  network,
  ethBalance,
  walletStatus,
  onConnectWallet,
  onDisconnectWallet,
  canNavigate,
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
  oraclePrice,
  leftRange,
  rightRange
}) => {
  const { classes } = useStyles()

  const [isAutoSwapAvailable, setIsAutoSwapAvailable] = useState(false)

  const [positionOpeningMethod] = useState<PositionOpeningMethod>(initialOpeningPositionMethod)

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [tokenADeposit, setTokenADeposit] = useState<string>('')
  const [tokenBDeposit, setTokenBDeposit] = useState<string>('')

  const [tokenACheckbox, setTokenACheckbox] = useState<boolean>(true)
  const [tokenBCheckbox, setTokenBCheckbox] = useState<boolean>(true)

  const [alignment, setAlignment] = useState<DepositOptions>(DepositOptions.Basic)

  const [slippTolerance] = React.useState<string>(initialSlippage)

  const [minimumSliderIndex, setMinimumSliderIndex] = useState<number>(0)
  const [refresherTime, setRefresherTime] = React.useState<number>(REFRESHER_INTERVAL)

  const concentrationArray: number[] = useMemo(() => {
    const validatedMidPrice = validConcentrationMidPriceTick(midPrice.index, isXtoY, tickSpacing)

    const array = getConcentrationArray(tickSpacing, 2, validatedMidPrice).sort((a, b) => a - b)
    const maxConcentrationArray = [...array, calculateConcentration(0, tickSpacing)]

    return maxConcentrationArray
  }, [tickSpacing, midPrice.index])

  const [concentrationIndex] = useState(
    getConcentrationIndex(
      concentrationArray,
      +initialConcentration < 2 ? 2 : initialConcentration ? +initialConcentration : 34
    )
  )

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

  const promotedPoolTierIndex =
    tokenAIndex === null || tokenBIndex === null
      ? undefined
      : promotedTiers.find(
          tier =>
            (tier.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (tier.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              tier.tokenY.equals(tokens[tokenAIndex].assetAddress))
        )?.index ?? undefined

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
      const ok = await confirm()
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
      minUtilizationPercentage,
      leftRange,
      rightRange
    )
  }

  return (
    <Grid container className={classes.wrapper}>
      <AddLiquidityDepositSelector
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
        }}
        onAddLiquidity={onAddLiquidity}
        onSwapAndAddLiquidity={onSwapAndAddLiquidity}
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
          const pom = tokenAIndex
          setTokenAIndex(tokenBIndex)
          setTokenBIndex(pom)
          onChangePositionTokens(tokenBIndex, tokenAIndex, currentFeeIndex)
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
    </Grid>
  )
}

export default AddLiquidityNewPosition
