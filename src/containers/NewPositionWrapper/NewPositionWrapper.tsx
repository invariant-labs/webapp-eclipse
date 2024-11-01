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
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  createPlaceholderLiquidityPlot,
  getCoinGeckoTokenPrice,
  getMockedTokenPrice,
  getNewTokenOrThrow,
  printBN,
  tickerToAddress
} from '@utils/utils'
import { BN } from '@project-serum/anchor'
import { actions as poolsActions } from '@store/reducers/pools'
import { actions, actions as positionsActions } from '@store/reducers/positions'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { network, timeoutError } from '@store/selectors/solanaConnection'
import {
  isLoadingLatestPoolsForTransaction,
  isLoadingPathTokens,
  isLoadingTicksAndTickMaps,
  isLoadingTokens,
  poolsArraySortedByFees
} from '@store/selectors/pools'
import { initPosition, plotTicks, shouldNotUpdateRange } from '@store/selectors/positions'
import { balanceLoading, status, balance, poolTokens } from '@store/selectors/solanaWallet'
import { openWalletSelectorModal } from '@utils/web3/selector'
import { VariantType } from 'notistack'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentSolanaConnection } from '@utils/web3/connection'
import { PublicKey } from '@solana/web3.js'
import { DECIMAL, feeToTickSpacing } from '@invariant-labs/sdk-eclipse/lib/utils'
import { InitMidPrice } from '@components/PriceRangePlot/PriceRangePlot'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { getLiquidityByX, getLiquidityByY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import { Decimal } from '@invariant-labs/sdk-eclipse/lib/market'

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
  const tokens = useSelector(poolTokens)
  const walletStatus = useSelector(status)
  const allPools = useSelector(poolsArraySortedByFees)
  const loadingTicksAndTickMaps = useSelector(isLoadingTicksAndTickMaps)
  const isBalanceLoading = useSelector(balanceLoading)
  const shouldNotUpdatePriceRange = useSelector(shouldNotUpdateRange)
  const currentNetwork = useSelector(network)
  const { success, inProgress } = useSelector(initPosition)
  // const [onlyUserPositions, setOnlyUserPositions] = useState(false)
  const { allData, loading: ticksLoading, hasError: hasTicksError } = useSelector(plotTicks)
  const ticksData = allData
  const isFetchingNewPool = useSelector(isLoadingLatestPoolsForTransaction)

  const [poolIndex, setPoolIndex] = useState<number | null>(null)

  const [progress, setProgress] = useState<ProgressState>('none')

  const [tokenAIndex, setTokenAIndex] = useState<number | null>(null)
  const [tokenBIndex, setTokenBIndex] = useState<number | null>(null)

  const [currentPairReversed, setCurrentPairReversed] = useState<boolean | null>(null)
  const [initialLoader, setInitialLoader] = useState(true)
  const isMountedRef = useRef(false)
  const navigate = useNavigate()
  const isCurrentlyLoadingTokens = useSelector(isLoadingTokens)
  const isTimeoutError = useSelector(timeoutError)
  const isPathTokensLoading = useSelector(isLoadingPathTokens)
  const { state } = useLocation()
  const [block, setBlock] = useState(state?.referer === 'stats')

  useEffect(() => {
    const pathTokens: string[] = []

    if (
      initialTokenFrom !== '' &&
      tokens.findIndex(
        token =>
          token.address.toString() === (tickerToAddress(currentNetwork, initialTokenFrom) ?? '')
      ) === -1
    ) {
      pathTokens.push(initialTokenFrom)
    }

    if (
      initialTokenTo !== '' &&
      tokens.findIndex(
        token =>
          token.address.toString() === (tickerToAddress(currentNetwork, initialTokenTo) ?? '')
      ) === -1
    ) {
      pathTokens.push(initialTokenTo)
    }

    if (pathTokens.length) {
      dispatch(poolsActions.getPathTokens(pathTokens))
    }

    setBlock(false)
  }, [tokens])

  const canNavigate = connection !== null && !isPathTokensLoading && !block

  console.log(!block, !isPathTokensLoading)

  useEffect(() => {
    if (canNavigate) {
      const tokenAIndex = tokens.findIndex(token => token.address.toString() === initialTokenFrom)
      if (tokenAIndex !== -1) {
        setTokenAIndex(tokenAIndex)
      }

      const tokenBIndex = tokens.findIndex(token => token.address.toString() === initialTokenTo)
      if (tokenBIndex !== -1) {
        setTokenBIndex(tokenBIndex)
      }
    }
  }, [canNavigate])

  useEffect(() => {
    if (canNavigate) {
      const tokenFromAddress = tickerToAddress(currentNetwork, initialTokenFrom)
      const tokenToAddress = tickerToAddress(currentNetwork, initialTokenTo)

      const tokenFromIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tokenFromAddress
      )

      const tokenToIndex = tokens.findIndex(
        token => token.assetAddress.toString() === tokenToAddress
      )

      if (
        tokenFromAddress !== null &&
        tokenFromIndex !== -1 &&
        (tokenToAddress === null || tokenToIndex === -1)
      ) {
        navigate(`/newPosition/${initialTokenFrom}/${initialFee}`)
      } else if (
        tokenFromAddress !== null &&
        tokenFromIndex !== -1 &&
        tokenToAddress !== null &&
        tokenToIndex !== -1
      ) {
        navigate(`/newPosition/${initialTokenFrom}/${initialTokenTo}/${initialFee}`)
      } else {
        navigate(`/newPosition/${initialFee}`)
      }
    }
  }, [tokens])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const liquidityRef = useRef<Decimal>({ v: new BN(0) })

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
  const [midPrice, setMidPrice] = useState<InitMidPrice>({
    index: 0,
    x: 1,
    sqrtPrice: 0
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
        x: calcPriceBySqrtPrice(allPools[poolIndex].sqrtPrice.v, isXtoY, xDecimal, yDecimal),
        sqrtPrice: allPools[poolIndex].sqrtPrice.v
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

  useEffect(() => {
    if (
      tokenAIndex !== null &&
      tokenBIndex !== null &&
      poolIndex !== null &&
      !allPools[poolIndex]
    ) {
      dispatch(
        poolsActions.getPoolData(
          new Pair(tokens[tokenAIndex].assetAddress, tokens[tokenBIndex].assetAddress, {
            fee,
            tickSpacing
          })
        )
      )
    }
  }, [poolIndex])

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
    if (tokenAIndex === null || (tokenAIndex !== null && !tokens[tokenAIndex])) {
      return
    }

    const id = tokens[tokenAIndex].coingeckoId ?? ''
    if (id.length) {
      setPriceALoading(true)
      getCoinGeckoTokenPrice(id)
        .then(data => setTokenAPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenAPriceData(getMockedTokenPrice(tokens[tokenAIndex].symbol, currentNetwork))
        )
        .finally(() => setPriceALoading(false))
    } else {
      setTokenAPriceData(undefined)
    }
  }, [tokenAIndex, tokens])

  const [tokenBPriceData, setTokenBPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [priceBLoading, setPriceBLoading] = useState(false)
  useEffect(() => {
    if (tokenBIndex === null || (tokenBIndex !== null && !tokens[tokenBIndex])) {
      return
    }

    const id = tokens[tokenBIndex].coingeckoId ?? ''
    if (id.length) {
      setPriceBLoading(true)
      getCoinGeckoTokenPrice(id)
        .then(data => setTokenBPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenBPriceData(getMockedTokenPrice(tokens[tokenBIndex].symbol, currentNetwork))
        )
        .finally(() => setPriceBLoading(false))
    } else {
      setTokenBPriceData(undefined)
    }
  }, [tokenBIndex, tokens])

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
            fee,
            tickSpacing
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

  useEffect(() => {
    if (isTimeoutError) {
      void onRefresh()
      dispatch(connectionActions.setTimeoutError(false))
    }
  }, [isTimeoutError])

  return (
    <NewPosition
      initialTokenFrom={initialTokenFrom}
      initialTokenTo={initialTokenTo}
      initialFee={initialFee}
      copyPoolAddressHandler={copyPoolAddressHandler}
      poolAddress={poolIndex !== null ? allPools[poolIndex].address.toString() : ''}
      tokens={tokens}
      data={data}
      midPrice={midPrice}
      setMidPrice={setMidPrice}
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
            setPoolIndex(index)
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
      isCurrentPoolExisting={poolIndex !== null && !!allPools[poolIndex]}
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
      onRefresh={onRefresh}
      isBalanceLoading={isBalanceLoading}
      shouldNotUpdatePriceRange={shouldNotUpdatePriceRange}
      unblockUpdatePriceRange={unblockUpdatePriceRange}
      isGetLiquidityError={false}
      onlyUserPositions={false} //TODO implement logic
      setOnlyUserPositions={() => {}} //TODO implement logic
      network={currentNetwork}
      isLoadingTokens={isCurrentlyLoadingTokens}
      ethBalance={ethBalance}
      walletStatus={walletStatus}
      onConnectWallet={openWalletSelectorModal}
      onDisconnectWallet={() => {
        dispatch(walletActions.disconnect())
      }}
      calcAmount={calcAmount}
      ticksLoading={ticksLoading}
      loadingTicksAndTickMaps={loadingTicksAndTickMaps}
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
        poolIndex !== null && !!allPools[poolIndex]
          ? allPools[poolIndex].sqrtPrice.v
          : calculatePriceSqrt(midPrice.index).v
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
      currentFeeIndex={feeIndex}
      onSlippageChange={onSlippageChange}
      initialSlippage={initialSlippage}
      canNavigate={canNavigate}
    />
  )
}

export default NewPositionWrapper
