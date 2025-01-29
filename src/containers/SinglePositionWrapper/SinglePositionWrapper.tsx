import { EmptyPlaceholder } from '@components/EmptyPlaceholder/EmptyPlaceholder'
import PositionDetails from '@components/PositionDetails/PositionDetails'
import { Grid } from '@mui/material'
import loader from '@static/gif/loader.gif'
import {
  calcPriceBySqrtPrice,
  calcPriceByTickIndex,
  calcYPerXPriceBySqrtPrice,
  createPlaceholderLiquidityPlot,
  getTokenPrice,
  getMockedTokenPrice,
  printBN
} from '@utils/utils'
import { actions as connectionActions } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/positions'
import { actions as lockerActions } from '@store/reducers/locker'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { network, timeoutError } from '@store/selectors/solanaConnection'
import {
  currentPositionTicks,
  isLoadingPositionsList,
  plotTicks,
  singlePositionData
} from '@store/selectors/positions'
import { balanceLoading, status } from '@store/selectors/solanaWallet'
import { VariantType } from 'notistack'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useStyles from './style'
import { TokenPriceData } from '@store/consts/types'
import { NoConnected } from '@components/NoConnected/NoConnected'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse/src'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { lockerState } from '@store/selectors/locker'

export interface IProps {
  id: string
}

export const SinglePositionWrapper: React.FC<IProps> = ({ id }) => {
  const { classes } = useStyles()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const currentNetwork = useSelector(network)
  const position = useSelector(singlePositionData(id))
  const { success, inProgress } = useSelector(lockerState)

  const isLoadingList = useSelector(isLoadingPositionsList)
  const {
    allData: ticksData,
    loading: ticksLoading,
    hasError: hasTicksError
  } = useSelector(plotTicks)

  const {
    lowerTick,
    upperTick,
    loading: currentPositionTicksLoading
  } = useSelector(currentPositionTicks)

  const walletStatus = useSelector(status)
  const isBalanceLoading = useSelector(balanceLoading)

  const isTimeoutError = useSelector(timeoutError)

  const [waitingForTicksData, setWaitingForTicksData] = useState<boolean | null>(null)

  const [showFeesLoader, setShowFeesLoader] = useState(true)

  const [isFinishedDelayRender, setIsFinishedDelayRender] = useState(false)

  const [isClosingPosition, setIsClosingPosition] = useState(false)
  // const poolKey = position?.poolKey ? poolKeyToString(position?.poolKey) : ''

  useEffect(() => {
    // if (position?.id && waitingForTicksData === null && allTickMaps[poolKey] !== undefined) {
    if (position?.id && waitingForTicksData === null) {
      setWaitingForTicksData(true)

      dispatch(actions.getCurrentPositionRangeTicks(id))
    }
  }, [position?.id])

  useEffect(() => {
    if (waitingForTicksData === true && !currentPositionTicksLoading) {
      setWaitingForTicksData(false)
    }
  }, [currentPositionTicksLoading])

  const midPrice = useMemo(() => {
    if (position?.poolData) {
      return {
        index: position.poolData.currentTickIndex,
        x: calcPriceBySqrtPrice(
          position.poolData.sqrtPrice,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id])

  const leftRange = useMemo(() => {
    if (position) {
      return {
        index: position.lowerTickIndex,
        x: calcPriceByTickIndex(
          position.lowerTickIndex,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id])

  const rightRange = useMemo(() => {
    if (position) {
      return {
        index: position.upperTickIndex,
        x: calcPriceByTickIndex(
          position.upperTickIndex,
          true,
          position.tokenX.decimals,
          position.tokenY.decimals
        )
      }
    }

    return {
      index: 0,
      x: 0
    }
  }, [position?.id])

  const min = useMemo(
    () =>
      position
        ? calcYPerXPriceBySqrtPrice(
            calculatePriceSqrt(position.lowerTickIndex),
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position?.lowerTickIndex]
  )
  const max = useMemo(
    () =>
      position
        ? calcYPerXPriceBySqrtPrice(
            calculatePriceSqrt(position.upperTickIndex),
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position?.upperTickIndex]
  )
  const current = useMemo(
    () =>
      position?.poolData
        ? calcPriceBySqrtPrice(
            position.poolData.sqrtPrice,
            true,
            position.tokenX.decimals,
            position.tokenY.decimals
          )
        : 0,
    [position]
  )

  const tokenXLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getX(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenX.decimals
        )
      } catch (error) {
        return 0
      }
    }

    return 0
  }, [position])

  const tokenYLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getY(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenY.decimals
        )
      } catch (error) {
        return 0
      }
    }

    return 0
  }, [position])

  const [tokenXClaim, tokenYClaim] = useMemo(() => {
    if (
      waitingForTicksData === false &&
      position?.poolData &&
      typeof lowerTick !== 'undefined' &&
      typeof upperTick !== 'undefined'
    ) {
      const [bnX, bnY] = calculateClaimAmount({
        position,
        tickLower: lowerTick,
        tickUpper: upperTick,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      setShowFeesLoader(false)

      return [+printBN(bnX, position.tokenX.decimals), +printBN(bnY, position.tokenY.decimals)]
    }

    return [0, 0]
  }, [position, lowerTick, upperTick, waitingForTicksData])

  console.log({ tokenXClaim, tokenYClaim })

  const data = useMemo(() => {
    if (ticksLoading && position) {
      return createPlaceholderLiquidityPlot(
        true,
        10,
        position.poolData.tickSpacing,
        position.tokenX.decimals,
        position.tokenY.decimals
      )
    }

    return ticksData
  }, [ticksData, ticksLoading, position?.id])

  const [triggerFetchPrice, setTriggerFetchPrice] = useState(false)

  const [tokenXPriceData, setTokenXPriceData] = useState<TokenPriceData | undefined>(undefined)
  const [tokenYPriceData, setTokenYPriceData] = useState<TokenPriceData | undefined>(undefined)

  useEffect(() => {
    if (!position) {
      return
    }

    const xId = position.tokenX.coingeckoId ?? ''
    if (xId.length) {
      getTokenPrice(xId)
        .then(data => setTokenXPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenXPriceData(getMockedTokenPrice(position.tokenX.symbol, currentNetwork))
        )
    } else {
      setTokenXPriceData(undefined)
    }

    const yId = position.tokenY.coingeckoId ?? ''
    if (yId.length) {
      getTokenPrice(yId)
        .then(data => setTokenYPriceData({ price: data ?? 0 }))
        .catch(() =>
          setTokenYPriceData(getMockedTokenPrice(position.tokenY.symbol, currentNetwork))
        )
    } else {
      setTokenYPriceData(undefined)
    }
  }, [position?.id, triggerFetchPrice])

  const copyPoolAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  useEffect(() => {
    // dispatch(actions.getRemainingPositions({ setLoaded: false }))
    const timer = setTimeout(() => {
      setIsFinishedDelayRender(true)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [walletStatus])

  useEffect(() => {
    // if (!position && walletStatus === Status.Initialized) {
    //   dispatch(actions.getSinglePosition(id))
    // }
    if (isFinishedDelayRender) {
      setIsFinishedDelayRender(false)
    }
  }, [walletStatus])

  // useEffect(() => {
  //   if (position && poolsArray.length !== 0) {
  //     dispatch(
  //       actions.getCurrentPlotTicks({
  //         poolIndex: position.poolData.poolIndex,
  //         isXtoY: true
  //         // fetchTicksAndTickmap: true
  //       })
  //     )
  //   }
  // }, [poolsArray])

  const onRefresh = () => {
    if (position?.positionIndex === undefined) {
      return
    }
    setTriggerFetchPrice(!triggerFetchPrice)
    setShowFeesLoader(true)
    dispatch(
      actions.getSinglePosition({ index: position.positionIndex, isLocked: position.isLocked })
    )

    if (position) {
      dispatch(
        actions.getCurrentPlotTicks({
          poolIndex: position.poolData.poolIndex,
          isXtoY: true
          // fetchTicksAndTickmap: true
        })
      )

      dispatch(walletActions.getBalance())
    }
  }

  useEffect(() => {
    if (isTimeoutError) {
      dispatch(actions.getPositionsList())
    }
  }, [isTimeoutError])

  useEffect(() => {
    if (!isLoadingList && isTimeoutError) {
      if (position?.positionIndex === undefined && isClosingPosition) {
        setIsClosingPosition(false)
        dispatch(connectionActions.setTimeoutError(false))
        navigate('/portfolio')
      } else {
        dispatch(connectionActions.setTimeoutError(false))
        onRefresh()
      }
    }
  }, [isLoadingList])

  if (position) {
    return (
      <PositionDetails
        tokenXAddress={position.tokenX.assetAddress}
        tokenYAddress={position.tokenY.assetAddress}
        poolAddress={position.poolData.address}
        copyPoolAddressHandler={copyPoolAddressHandler}
        detailsData={data}
        midPrice={midPrice}
        leftRange={leftRange}
        rightRange={rightRange}
        currentPrice={current}
        onClickClaimFee={() => {
          setShowFeesLoader(true)
          dispatch(actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked }))
        }}
        lockPosition={() => {
          dispatch(
            lockerActions.lockPosition({ index: position.positionIndex, network: currentNetwork })
          )
        }}
        closePosition={claimFarmRewards => {
          setIsClosingPosition(true)
          dispatch(
            actions.closePosition({
              positionIndex: position.positionIndex,
              onSuccess: () => {
                navigate('/portfolio')
              },
              claimFarmRewards
            })
          )
        }}
        ticksLoading={ticksLoading || waitingForTicksData || !position}
        tickSpacing={position?.poolData.tickSpacing ?? 1}
        tokenX={{
          name: position.tokenX.symbol,
          icon: position.tokenX.logoURI,
          decimal: position.tokenX.decimals,
          balance: +printBN(position.tokenX.balance, position.tokenX.decimals),
          liqValue: tokenXLiquidity,
          claimValue: tokenXClaim,
          usdValue:
            typeof tokenXPriceData?.price === 'undefined'
              ? undefined
              : tokenXPriceData.price * +printBN(position.tokenX.balance, position.tokenX.decimals)
        }}
        tokenXPriceData={tokenXPriceData}
        tokenY={{
          name: position.tokenY.symbol,
          icon: position.tokenY.logoURI,
          decimal: position.tokenY.decimals,
          balance: +printBN(position.tokenY.balance, position.tokenY.decimals),
          liqValue: tokenYLiquidity,
          claimValue: tokenYClaim,
          usdValue:
            typeof tokenYPriceData?.price === 'undefined'
              ? undefined
              : tokenYPriceData.price * +printBN(position.tokenY.balance, position.tokenY.decimals)
        }}
        tokenYPriceData={tokenYPriceData}
        fee={position.poolData.fee}
        min={min}
        max={max}
        showFeesLoader={showFeesLoader}
        hasTicksError={hasTicksError}
        reloadHandler={() => {
          dispatch(
            actions.getCurrentPlotTicks({
              poolIndex: position.poolData.poolIndex,
              isXtoY: true
            })
          )
        }}
        onRefresh={onRefresh}
        isBalanceLoading={isBalanceLoading}
        network={currentNetwork}
        isLocked={position.isLocked}
        success={success}
        inProgress={inProgress}
      />
    )
  }
  if ((isLoadingList && walletStatus === Status.Initialized) || !isFinishedDelayRender) {
    return (
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        className={classes.fullHeightContainer}>
        <img src={loader} className={classes.loading} alt='Loading' />
      </Grid>
    )
  }
  if (walletStatus !== Status.Initialized) {
    return (
      <Grid
        display='flex'
        position='relative'
        justifyContent='center'
        className={classes.fullHeightContainer}>
        <NoConnected
          onConnect={() => {
            dispatch(walletActions.connect(false))
          }}
          title='Connect a wallet to view your position,'
          descCustomText='or start exploring liquidity pools now!'
        />
      </Grid>
    )
  }

  return (
    <Grid
      display='flex'
      position='relative'
      justifyContent='center'
      className={classes.fullHeightContainer}>
      <EmptyPlaceholder
        desc='The position does not exist in your list! '
        onAction={() => navigate('/portfolio')}
        buttonName='Back to positions'
      />
    </Grid>
  )
}
