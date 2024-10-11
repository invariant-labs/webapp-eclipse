import { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import NewPosition from '@components/NewPosition/NewPosition'

import {
  ALL_FEE_TIERS_DATA,
  DEFAULT_NEW_POSITION_SLIPPAGE,
  bestTiers,
  commonTokensForNetworks
} from '@store/consts/static'
import { PositionOpeningMethod, TokenPriceData } from '@store/consts/types'
import {
  addNewTokenToLocalStorage,
  calcPriceByTickIndex,
  calcYPerXPriceBySqrtPrice,
  createPlaceholderLiquidityPlot,
  getCoingeckoTokenPrice,
  getMockedTokenPrice,
  getNewTokenOrThrow,
  printBN,
  tickerToAddress
} from '@utils/utils'
import { BN } from '@project-serum/anchor'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions, actions as positionsActions } from '@store/reducers/positions'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { network } from '@store/selectors/solanaConnection'
import {
  isLoadingLatestPoolsForTransaction,
  pools,
  poolsArraySortedByFees,
  volumeRanges
} from '@store/selectors/pools'
import { initPosition, plotTicks, shouldNotUpdateRange } from '@store/selectors/positions'
import {
  address,
  balanceLoading,
  status,
  balance,
  poolTokens,
  minPoolEthBalance
} from '@store/selectors/solanaWallet'
import { openWalletSelectorModal } from '@utils/web3/selector'
import { VariantType } from 'notistack'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import { DECIMAL, feeToTickSpacing, getMaxTick } from '@invariant-labs/sdk-eclipse/lib/utils'
import { TickPlotPositionData } from '@components/PriceRangePlot/PriceRangePlot'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'

export interface IProps {
  initialTokenFrom: string
  initialTokenTo: string
  initialFee: string
}

export const NewPositionWrapper: React.FC<IProps> = ({
  initialTokenFrom,
  initialTokenTo,
  initialFee
}) => {
  const dispatch = useDispatch()

  const connection = getCurrentSolanaConnection()

  const ethBalance = useSelector(balance)
  const ethBalanceWithoutFee = useSelector(minPoolEthBalance)
  const tokens = useSelector(poolTokens)
  const walletStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const poolsVolumeRanges = useSelector(volumeRanges)
  const poolsData = useSelector(pools)

  const isBalanceLoading = useSelector(balanceLoading)
  const shouldNotUpdatePriceRange = useSelector(shouldNotUpdateRange)

  const { success, inProgress } = useSelector(initPosition)

  const [onlyUserPositions, setOnlyUserPositions] = useState(false)

  const {
    allData,
    userData,
    loading: ticksLoading,
    hasError: hasTicksError
  } = useSelector(plotTicks)
  const ticksData = onlyUserPositions ? userData : allData

  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)
  const currentNetwork = useSelector(network)

  const [poolIndex, setPoolIndex] = useState<number | null>(null)

  const [progress, setProgress] = useState<ProgressState>('none')

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [currentPairReversed, setCurrentPairReversed] = useState<boolean | null>(null)

  const [initialLoader, setInitialLoader] = useState(true)

  const [isGetLiquidityError, setIsGetLiquidityError] = useState(false)

  const isMountedRef = useRef(false)
  const navigate = useNavigate()
  // const isCurrentlyLoadingTokens = useSelector(isLoadingTokens)
  // const isCurrentlyLoadingTokensError = useSelector(isLoadingTokensError)

  useEffect(() => {
    const tokensToFetch = []

    const tokenFromAddress = tickerToAddress(currentNetwork, initialTokenFrom)
    const tokenToAddress = tickerToAddress(currentNetwork, initialTokenTo)
    if (!tokenFromAddress || !tokenToAddress) {
      return
    }
    tokens.findIndex(key => key.assetAddress.toString() === tokenFromAddress) !== -1

    if (
      initialTokenFrom &&
      tokens.findIndex(key => key.assetAddress.toString() === tokenFromAddress) !== -1
    ) {
      tokensToFetch.push(tickerToAddress(currentNetwork, initialTokenFrom))
    }

    if (
      initialTokenTo &&
      tokens.findIndex(key => key.assetAddress.toString() === tokenToAddress) !== -1
    ) {
      tokensToFetch.push(tickerToAddress(currentNetwork, initialTokenTo))
    }

    // if (tokensToFetch.length) {
    //   dispatch(poolsActions.getTokens(tokensToFetch))
    // } else {
    //   dispatch(poolsActions.addTokens({}))
    // }
  }, [])

  useEffect(() => {
    // if (isCurrentlyLoadingTokensError) {
    const tokenFromAddress = tickerToAddress(currentNetwork, initialTokenFrom)
    const tokenToAddress = tickerToAddress(currentNetwork, initialTokenTo)
    if (!tokenFromAddress || !tokenToAddress) {
      return
    }

    if (tokenFromAddress && !tokenToAddress) {
      navigate(`/newPosition/${initialTokenFrom}/${initialFee}`)
      const tokenFromIndex = Object.values(tokens).findIndex(
        token => token.assetAddress.toString() === tokenFromAddress
      )
      setTokenAIndex(tokenFromIndex)
    } else if (tokenFromAddress && tokenToAddress) {
      const tokenFromIndex = Object.values(tokens).findIndex(
        token => token.assetAddress.toString() === tokenFromAddress
      )
      const tokenToIndex = Object.values(tokens).findIndex(
        token => token.assetAddress.toString() === tokenToAddress
      )
      setTokenAIndex(tokenFromIndex)
      setTokenBIndex(tokenToIndex)

      navigate(`/newPosition/${initialTokenFrom}/${initialTokenTo}/${initialFee}`)
    }

    // }
  }, [initialTokenTo, initialTokenFrom])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const liquidityRef = useRef<any>({ v: new BN(0) })

  useEffect(() => {
    setProgress('none')
  }, [poolIndex])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex,
            isXtoY: allPools[poolIndex].tokenX.equals(
              tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
            ),
            disableLoading: true
          })
        )
      }

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 500)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
        dispatch(actions.setInitPositionSuccess(false))
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

  const [feeIndex, setFeeIndex] = useState(0)

  const fee = useMemo(() => ALL_FEE_TIERS_DATA[feeIndex].tier.fee, [feeIndex])

  const tickSpacing = useMemo(
    () =>
      ALL_FEE_TIERS_DATA[feeIndex].tier.tickSpacing ??
      feeToTickSpacing(ALL_FEE_TIERS_DATA[feeIndex].tier.fee),
    [feeIndex]
  )

  const [midPrice, setMidPrice] = useState<TickPlotPositionData>({
    index: 0,
    x: 1
    // sqrtPrice: BN(0)
  })

  const isWaitingForNewPool = useMemo(() => {
    if (poolIndex !== null) {
      return false
    }

    return isFetchingNewPool
  }, [isFetchingNewPool, poolIndex])

  useEffect(() => {
    if (initialLoader && !isWaitingForNewPool) {
      setInitialLoader(false)
    }
  }, [isWaitingForNewPool])

  useEffect(() => {
    if (
      !isWaitingForNewPool &&
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      tokenAIndex !== tokenBIndex
    ) {
      const index = allPools.findIndex(
        pool =>
          pool.fee.v.eq(fee) &&
          ((pool.tokenX.equals(tokens[tokenAIndex].assetAddress) &&
            pool.tokenY.equals(tokens[tokenBIndex].assetAddress)) ||
            (pool.tokenX.equals(tokens[tokenBIndex].assetAddress) &&
              pool.tokenY.equals(tokens[tokenAIndex].assetAddress)))
      )
      setPoolIndex(index !== -1 ? index : null)

      if (index !== -1) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex: index,
            isXtoY: allPools[index].tokenX.equals(tokens[tokenAIndex].assetAddress)
          })
        )
      }
    }
  }, [isWaitingForNewPool])

  useEffect(() => {
    if (poolIndex !== null) {
      setMidPrice({
        index: allPools[poolIndex].currentTickIndex,
        x:
          calcYPerXPriceBySqrtPrice(allPools[poolIndex].sqrtPrice.v, xDecimal, yDecimal) **
          (isXtoY ? 1 : -1)
        // sqrtPrice: allPools[poolIndex].sqrtPrice
      })
    }
  }, [poolIndex, isXtoY, xDecimal, yDecimal, poolsData])

  useEffect(() => {
    if (poolIndex === null) {
      setMidPrice({
        index: 0,
        x: calcPriceByTickIndex(0, isXtoY, xDecimal, yDecimal)
        // sqrtPrice: BN(0)
      })
    }
  }, [poolIndex, isXtoY, xDecimal, yDecimal])

  const data = useMemo(() => {
    if (ticksLoading) {
      return createPlaceholderLiquidityPlot(isXtoY, 10, tickSpacing, xDecimal, yDecimal)
    }

    if (currentPairReversed === true) {
      return ticksData.map(tick => ({ ...tick, x: 1 / tick.x })).reverse()
    }

    return ticksData
  }, [ticksData, ticksLoading, isXtoY, tickSpacing, xDecimal, yDecimal, currentPairReversed])

  useEffect(() => {
    if (
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      poolIndex === null &&
      progress === 'approvedWithSuccess'
    ) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee
          })
        )
      )
    }
  }, [progress])

  const addTokenHandler = (address: string) => {
    if (
      connection !== null &&
      tokens.findIndex(token => token.address.toString() === address) === -1
    ) {
      getNewTokenOrThrow(address, connection)
        .then(data => {
          dispatch(poolsActions.addTokens(data))
          addNewTokenToLocalStorage(address, currentNetwork)
          dispatch(
            snackbarsActions.add({
              message: 'Token added.',
              variant: 'success',
              persist: false
            })
          )
        })
        .catch(() => {
          dispatch(
            snackbarsActions.add({
              message: 'Token add failed.',
              variant: 'error',
              persist: false
            })
          )
        })
    } else {
      dispatch(
        snackbarsActions.add({
          message: 'Token already in list.',
          variant: 'info',
          persist: false
        })
      )
    }
  }

  const copyPoolAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  const initialIsConcentrationOpening =
    localStorage.getItem('OPENING_METHOD') === 'concentration' ||
    localStorage.getItem('OPENING_METHOD') === null

  const setPositionOpeningMethod = (val: PositionOpeningMethod) => {
    localStorage.setItem('OPENING_METHOD', val)
  }

  const initialHideUnknownTokensValue =
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === 'true' ||
    localStorage.getItem('HIDE_UNKNOWN_TOKENS') === null

  const setHideUnknownTokensValue = (val: boolean) => {
    localStorage.setItem('HIDE_UNKNOWN_TOKENS', val ? 'true' : 'false')
  }

  const [tokenAPriceData, setTokenAPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceALoading, setPriceALoading] = useState(false)
  useEffect(() => {
    if (tokenAIndex === null) {
      return
    }

    const id = tokens[tokenAIndex].coingeckoId ?? ''
    if (id.length) {
      setPriceALoading(true)
      getCoingeckoTokenPrice(id)
        .then(data => setTokenAPriceData(data))
        .catch(() =>
          setTokenAPriceData(getMockedTokenPrice(tokens[tokenAIndex].symbol, currentNetwork))
        )
        .finally(() => setPriceALoading(false))
    } else {
      setTokenAPriceData(undefined)
    }
  }, [tokenAIndex])

  const [tokenBPriceData, setTokenBPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceBLoading, setPriceBLoading] = useState(false)
  useEffect(() => {
    if (tokenBIndex === null) {
      return
    }

    const id = tokens[tokenBIndex].coingeckoId ?? ''
    if (id.length) {
      setPriceBLoading(true)
      getCoingeckoTokenPrice(id)
        .then(data => setTokenBPriceData(data))
        .catch(() =>
          setTokenBPriceData(getMockedTokenPrice(tokens[tokenBIndex].symbol, currentNetwork))
        )
        .finally(() => setPriceBLoading(false))
    } else {
      setTokenBPriceData(undefined)
    }
  }, [tokenBIndex])

  const currentVolumeRange = useMemo(() => {
    if (poolIndex === null) {
      return undefined
    }

    const poolAddress = allPools[poolIndex].address.toString()

    if (!poolsVolumeRanges[poolAddress]) {
      return undefined
    }

    const lowerTicks: number[] = poolsVolumeRanges[poolAddress]
      .map(range => (range.tickLower === null ? undefined : range.tickLower))
      .filter(tick => typeof tick !== 'undefined') as number[]
    const upperTicks: number[] = poolsVolumeRanges[poolAddress]
      .map(range => (range.tickUpper === null ? undefined : range.tickUpper))
      .filter(tick => typeof tick !== 'undefined') as number[]

    const lowerPrice = calcPriceByTickIndex(
      !lowerTicks.length || !upperTicks.length
        ? allPools[poolIndex].currentTickIndex
        : Math.min(...lowerTicks),
      isXtoY,
      xDecimal,
      yDecimal
    )

    const upperPrice = calcPriceByTickIndex(
      !lowerTicks.length || !upperTicks.length
        ? Math.min(
            allPools[poolIndex].currentTickIndex + allPools[poolIndex].tickSpacing,
            getMaxTick(tickSpacing)
          )
        : Math.max(...upperTicks),
      isXtoY,
      xDecimal,
      yDecimal
    )

    return {
      min: Math.min(lowerPrice, upperPrice),
      max: Math.max(lowerPrice, upperPrice)
    }
  }, [poolsVolumeRanges, poolIndex, isXtoY, xDecimal, yDecimal])

  const initialSlippage =
    localStorage.getItem('INVARIANT_NEW_POSITION_SLIPPAGE') ?? DEFAULT_NEW_POSITION_SLIPPAGE

  const onSlippageChange = (slippage: string) => {
    localStorage.setItem('INVARIANT_NEW_POSITION_SLIPPAGE', slippage)
  }

  const calcAmount = (amount: BN, left: number, right: number, tokenAddress: PublicKey) => {
    if (tokenAIndex === null || tokenBIndex === null || isNaN(left) || isNaN(right)) {
      return new BN(0)
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
          poolIndex !== null ? allPools[poolIndex].sqrtPrice : calculatePriceSqrt(midPrice.index),
          true
        )
        if (isMountedRef.current) {
          liquidityRef.current = result.liquidity
        }
        return result.y
      }
      const result = getLiquidityByY(
        amount,
        lowerTick,
        upperTick,
        poolIndex !== null ? allPools[poolIndex].sqrtPrice : calculatePriceSqrt(midPrice.index),
        true
      )
      if (isMountedRef.current) {
        liquidityRef.current = result.liquidity
      }
      return result.x
    } catch (error) {
      const result = (byX ? getLiquidityByY : getLiquidityByX)(
        amount,
        lowerTick,
        upperTick,
        poolIndex !== null ? allPools[poolIndex].sqrtPrice : calculatePriceSqrt(midPrice.index),
        true
      )
      if (isMountedRef.current) {
        liquidityRef.current = result.liquidity
      }
    }

    return new BN(0)
  }

  const unblockUpdatePriceRange = () => {
    dispatch(positionsActions.setShouldNotUpdateRange(false))
  }

  const onRefresh = () => {
    if (!success) {
      dispatch(positionsActions.setShouldNotUpdateRange(true))
    }

    if (tokenAIndex !== null && tokenBIndex !== null) {
      dispatch(walletActions.getBalance())

      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee
          })
        )
      )

      if (poolIndex !== null) {
        dispatch(
          actions.getCurrentPlotTicks({
            poolIndex,
            isXtoY: allPools[poolIndex].tokenX.equals(
              tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
            )
          })
        )
      }
    }
  }

  return (
    <NewPosition
      initialTokenFrom={initialTokenFrom}
      initialTokenTo={initialTokenTo}
      initialFee={initialFee}
      copyPoolAddressHandler={copyPoolAddressHandler}
      poolAddress={poolIndex !== null ? allPools[poolIndex].address.toString() : ''}
      tokens={tokens}
      onChangePositionTokens={(tokenA, tokenB, feeTierIndex) => {
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
              pool.fee.v.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee) &&
              ((pool.tokenX.equals(tokens[tokenA].assetAddress) &&
                pool.tokenY.equals(tokens[tokenB].assetAddress)) ||
                (pool.tokenX.equals(tokens[tokenB].assetAddress) &&
                  pool.tokenY.equals(tokens[tokenA].assetAddress)))
          )

          if (
            index !== poolIndex &&
            !(
              tokenAIndex === tokenB &&
              tokenBIndex === tokenA &&
              fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
            )
          ) {
            if (isMountedRef.current) {
              setPoolIndex(index !== -1 ? index : null)
              setCurrentPairReversed(null)
            }
          } else if (
            tokenAIndex === tokenB &&
            tokenBIndex === tokenA &&
            fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
          ) {
            if (isMountedRef.current) {
              setCurrentPairReversed(currentPairReversed === null ? true : !currentPairReversed)
            }
          }

          if (index !== -1 && index !== poolIndex) {
            dispatch(
              actions.getCurrentPlotTicks({
                poolIndex: index,
                isXtoY: allPools[index].tokenX.equals(tokens[tokenA].assetAddress)
              })
            )
          } else if (
            !(
              tokenAIndex === tokenB &&
              tokenBIndex === tokenA &&
              fee.eq(ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee)
            )
          ) {
            dispatch(
              poolsActions.getPoolData(
                new Pair(tokens[tokenA].assetAddress, tokens[tokenB].assetAddress, {
                  fee: ALL_FEE_TIERS_DATA[feeTierIndex].tier.fee,
                  tickSpacing: ALL_FEE_TIERS_DATA[feeTierIndex].tier.tickSpacing
                })
              )
            )
          }
        }

        setTokenAIndex(tokenA)
        setTokenBIndex(tokenB)
        setFeeIndex(feeTierIndex)
      }}
      feeTiers={ALL_FEE_TIERS_DATA.map(tier => ({
        feeValue: +printBN(tier.tier.fee, DECIMAL - 2)
      }))}
      data={data}
      midPrice={midPrice}
      setMidPrice={setMidPrice}
      addLiquidityHandler={(leftTickIndex, rightTickIndex, xAmount, yAmount, slippage) => {
        if (tokenAIndex === null || tokenBIndex === null) {
          return
        }
        if (poolIndex !== null) {
          dispatch(positionsActions.setShouldNotUpdateRange(true))
        }
        if (progress === 'none') {
          setProgress('progress')
        }

        const lowerTickIndex = Math.min(leftTickIndex, rightTickIndex)
        const upperTickIndex = Math.max(leftTickIndex, rightTickIndex)

        dispatch(
          positionsActions.initPosition({
            tokenX: tokens[isXtoY ? tokenAIndex : tokenBIndex].assetAddress,
            tokenY: tokens[isXtoY ? tokenBIndex : tokenAIndex].assetAddress,
            fee,
            lowerTick: lowerTickIndex,
            upperTick: upperTickIndex,
            liquidityDelta: liquidityRef.current,
            initPool: poolIndex === null,
            initTick: poolIndex === null ? midPrice.index : undefined,
            xAmount: Math.floor(xAmount),
            yAmount: Math.floor(yAmount),
            slippage,
            tickSpacing,
            knownPrice:
              poolIndex === null
                ? calculatePriceSqrt(midPrice.index)
                : allPools[poolIndex].sqrtPrice
          })
        )
      }}
      isCurrentPoolExisting={poolIndex !== null}
      onRefresh={onRefresh}
      isBalanceLoading={isBalanceLoading}
      shouldNotUpdatePriceRange={shouldNotUpdatePriceRange}
      unblockUpdatePriceRange={unblockUpdatePriceRange}
      isGetLiquidityError={isGetLiquidityError}
      onlyUserPositions={onlyUserPositions}
      setOnlyUserPositions={setOnlyUserPositions}
      network={currentNetwork}
      // isLoadingTokens={isCurrentlyLoadingTokens}
      ethBalance={ethBalance}
      walletStatus={walletStatus}
      onConnectWallet={async () => {
        await openWalletSelectorModal()
        dispatch(walletActions.connect())
      }}
      onDisconnectWallet={() => {
        dispatch(walletActions.disconnect())
      }}
      calcAmount={calcAmount}
      ticksLoading={ticksLoading}
      loadingTicksAndTickMaps={true} //todo
      isLoadingTokens={false} //todo
      progress={progress}
      isXtoY={isXtoY}
      tickSpacing={tickSpacing}
      xDecimal={xDecimal}
      yDecimal={yDecimal}
      isWaitingForNewPool={isWaitingForNewPool || initialLoader}
      poolIndex={poolIndex}
      currentPairReversed={currentPairReversed}
      bestTiers={bestTiers[currentNetwork]}
      currentPriceSqrt={
        poolIndex !== null ? allPools[poolIndex].sqrtPrice.v : calculatePriceSqrt(midPrice.index).v
      }
      handleAddToken={addTokenHandler}
      commonTokens={commonTokensForNetworks[currentNetwork]}
      initialOpeningPositionMethod={initialIsConcentrationOpening ? 'concentration' : 'range'}
      onPositionOpeningMethodChange={setPositionOpeningMethod}
      initialHideUnknownTokensValue={initialHideUnknownTokensValue}
      onHideUnknownTokensChange={setHideUnknownTokensValue}
      tokenAPriceData={tokenAPriceData}
      tokenBPriceData={tokenBPriceData}
      priceALoading={priceALoading}
      priceBLoading={priceBLoading}
      hasTicksError={hasTicksError}
      reloadHandler={() => {
        if (poolIndex !== null && tokenAIndex !== null && tokenBIndex !== null) {
          dispatch(
            actions.getCurrentPlotTicks({
              poolIndex,
              isXtoY: allPools[poolIndex].tokenX.equals(
                tokens[currentPairReversed === true ? tokenBIndex : tokenAIndex].assetAddress
              )
            })
          )
        }
      }}
      plotVolumeRange={currentVolumeRange}
      currentFeeIndex={feeIndex}
      onSlippageChange={onSlippageChange}
      initialSlippage={initialSlippage}
      ethBalanceWithoutFee={ethBalanceWithoutFee}
    />
  )
}

export default NewPositionWrapper
