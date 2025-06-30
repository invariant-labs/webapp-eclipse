import {
  Intervals,
  NetworkType,
  POSITIONS_PER_PAGE,
  WETH_CLOSE_POSITION_LAMPORTS_MAIN,
  WETH_CLOSE_POSITION_LAMPORTS_TEST
} from '@store/consts/static'
import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import {
  calculateClaimAmount,
  DECIMAL,
  getMaxTick,
  getMinTick
} from '@invariant-labs/sdk-eclipse/lib/utils'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { actions, LiquidityPools } from '@store/reducers/positions'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import {
  isLoadingPositionsList,
  lastPageSelector,
  lockedPositionsWithPoolsData,
  PositionData,
  positionListSwitcher,
  positionsWithPoolsData,
  prices,
  shouldDisable
} from '@store/selectors/positions'
import {
  address,
  balanceLoading,
  status,
  swapTokens,
  balance,
  overviewSwitch
} from '@store/selectors/solanaWallet'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { calcYPerXPriceBySqrtPrice, printBN, ROUTES } from '@utils/utils'
import { network } from '@store/selectors/solanaConnection'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as actionsStats } from '@store/reducers/stats'
import { actions as lockerActions } from '@store/reducers/locker'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { actions as navigationActions } from '@store/reducers/navigation'
import { Grid, useMediaQuery } from '@mui/material'
import { theme } from '@static/theme'
import useStyles from './styles'
import Portfolio from '@components/Portfolio/Portfolio'
import { VariantType } from 'notistack'
import { IPositionItem } from '@store/consts/types'
import { portfolioSearch } from '@store/selectors/navigation'
import { ISearchToken } from '@common/FilterSearch/FilterSearch'

const PortfolioWrapper = () => {
  const { classes } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const walletAddress = useSelector(address)
  const list = useSelector(positionsWithPoolsData)
  const lockedList = useSelector(lockedPositionsWithPoolsData)
  const isLoading = useSelector(isLoadingPositionsList)
  const lastPage = useSelector(lastPageSelector)
  const walletStatus = useSelector(status)
  const currentNetwork = useSelector(network)
  const tokensList = useSelector(swapTokens)
  const isBalanceLoading = useSelector(balanceLoading)
  const pricesData = useSelector(prices)
  const ethBalance = useSelector(balance)
  const disabledButton = useSelector(shouldDisable)
  const positionListAlignment = useSelector(positionListSwitcher)
  const overviewSelectedTab = useSelector(overviewSwitch)
  const searchParamsToken = useSelector(portfolioSearch)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const setSearchTokensValue = (tokens: ISearchToken[]) => {
    dispatch(
      navigationActions.setSearch({
        section: 'portfolioTokens',
        type: 'filteredTokens',
        filteredTokens: tokens
      })
    )
  }

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  const setLastPage = (page: number) => {
    dispatch(actions.setLastPage(page))
  }

  useEffect(() => {
    if (list.length === 0) {
      setLastPage(1)
    }

    if (lastPage > Math.ceil(list.length / POSITIONS_PER_PAGE)) {
      setLastPage(lastPage === 1 ? 1 : lastPage - 1)
    }
  }, [list])

  const handleRefresh = () => {
    dispatch(actions.getPositionsList())
  }

  useEffect(() => {
    dispatch(actionsStats.getCurrentIntervalStats({ interval: Intervals.Daily }))
  }, [])

  const handleLockPosition = (index: number) => {
    dispatch(lockerActions.lockPosition({ index, network: currentNetwork }))
  }

  const canClosePosition = useMemo(() => {
    if (currentNetwork === NetworkType.Testnet) {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_TEST)
    } else {
      return ethBalance.gte(WETH_CLOSE_POSITION_LAMPORTS_MAIN)
    }
  }, [ethBalance, currentNetwork])
  const handleClosePosition = (index: number) => {
    canClosePosition
      ? dispatch(
          actions.closePosition({
            positionIndex: index,
            onSuccess: () => {
              navigate(ROUTES.PORTFOLIO)
            }
          })
        )
      : dispatch(
          snackbarActions.add({
            message: 'Not enough ETH balance to close position',
            variant: 'error',
            persist: false
          })
        )
  }

  const handleClaimFee = (index: number, isLocked: boolean) => {
    dispatch(actions.claimFee({ index, isLocked }))
  }

  const calculateUnclaimedFees = (position: PositionData) => {
    const [bnX, bnY] = calculateClaimAmount({
      position: position,
      tickLower: position.lowerTick,
      tickUpper: position.upperTick,
      tickCurrent: position.poolData.currentTickIndex,
      feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
      feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
    })

    const xValue =
      +printBN(bnX, position.tokenX.decimals) *
      (pricesData.data[position.tokenX.assetAddress.toString()] ?? 0)
    const yValue =
      +printBN(bnY, position.tokenY.decimals) *
      (pricesData.data[position.tokenY.assetAddress.toString()] ?? 0)

    const unclaimedFeesInUSD = xValue + yValue
    return {
      usdValue: unclaimedFeesInUSD,
      isClaimAvailable:
        +printBN(bnX, position.tokenX.decimals) > 0 || +printBN(bnY, position.tokenY.decimals) > 0
    }
  }

  const data: IPositionItem[] = useMemo(
    () =>
      list.map(position => {
        const lowerPrice = calcYPerXPriceBySqrtPrice(
          calculatePriceSqrt(position.lowerTickIndex),
          position.tokenX.decimals,
          position.tokenY.decimals
        )
        const upperPrice = calcYPerXPriceBySqrtPrice(
          calculatePriceSqrt(position.upperTickIndex),
          position.tokenX.decimals,
          position.tokenY.decimals
        )

        const minTick = getMinTick(position.poolData.tickSpacing)
        const maxTick = getMaxTick(position.poolData.tickSpacing)

        const min = Math.min(lowerPrice, upperPrice)
        const max = Math.max(lowerPrice, upperPrice)

        let tokenXLiq, tokenYLiq

        try {
          tokenXLiq = +printBN(
            getX(
              position.liquidity,
              calculatePriceSqrt(position.upperTickIndex),
              position.poolData.sqrtPrice,
              calculatePriceSqrt(position.lowerTickIndex)
            ),
            position.tokenX.decimals
          )
        } catch {
          tokenXLiq = 0
        }

        try {
          tokenYLiq = +printBN(
            getY(
              position.liquidity,
              calculatePriceSqrt(position.upperTickIndex),
              position.poolData.sqrtPrice,
              calculatePriceSqrt(position.lowerTickIndex)
            ),
            position.tokenY.decimals
          )
        } catch {
          tokenYLiq = 0
        }

        const currentPrice = calcYPerXPriceBySqrtPrice(
          position.poolData.sqrtPrice,
          position.tokenX.decimals,
          position.tokenY.decimals
        )

        const valueX = tokenXLiq + tokenYLiq / currentPrice
        const valueY = tokenYLiq + tokenXLiq * currentPrice

        const { usdValue, isClaimAvailable } = calculateUnclaimedFees(position)
        return {
          tokenXName: position.tokenX.symbol,
          tokenYName: position.tokenY.symbol,
          tokenXIcon: position.tokenX.logoURI,
          tokenYIcon: position.tokenY.logoURI,
          poolAddress: position.poolData.address,
          liquidity: position.liquidity,
          poolData: position.poolData,
          fee: +printBN(position.poolData.fee, DECIMAL - 2),
          min,
          max,
          position,
          valueX,
          valueY,
          address: walletAddress.toString(),
          id: position.id.toString() + '_' + position.pool.toString(),
          isActive: currentPrice >= min && currentPrice <= max,
          currentPrice,
          tokenXLiq,
          tokenYLiq,
          network: currentNetwork,
          isFullRange: position.lowerTickIndex === minTick && position.upperTickIndex === maxTick,
          isLocked: position.isLocked,
          unclaimedFeesInUSD: { value: usdValue, loading: position.ticksLoading, isClaimAvailable }
        }
      }),
    [list, pricesData]
  )

  const lockedData: IPositionItem[] = useMemo(
    () =>
      lockedList.map(position => {
        const lowerPrice = calcYPerXPriceBySqrtPrice(
          calculatePriceSqrt(position.lowerTickIndex),
          position.tokenX.decimals,
          position.tokenY.decimals
        )
        const upperPrice = calcYPerXPriceBySqrtPrice(
          calculatePriceSqrt(position.upperTickIndex),
          position.tokenX.decimals,
          position.tokenY.decimals
        )

        const minTick = getMinTick(position.poolData.tickSpacing)
        const maxTick = getMaxTick(position.poolData.tickSpacing)

        const min = Math.min(lowerPrice, upperPrice)
        const max = Math.max(lowerPrice, upperPrice)

        let tokenXLiq, tokenYLiq

        try {
          tokenXLiq = +printBN(
            getX(
              position.liquidity,
              calculatePriceSqrt(position.upperTickIndex),
              position.poolData.sqrtPrice,
              calculatePriceSqrt(position.lowerTickIndex)
            ),
            position.tokenX.decimals
          )
        } catch {
          tokenXLiq = 0
        }

        try {
          tokenYLiq = +printBN(
            getY(
              position.liquidity,
              calculatePriceSqrt(position.upperTickIndex),
              position.poolData.sqrtPrice,
              calculatePriceSqrt(position.lowerTickIndex)
            ),
            position.tokenY.decimals
          )
        } catch {
          tokenYLiq = 0
        }

        const currentPrice = calcYPerXPriceBySqrtPrice(
          position.poolData.sqrtPrice,
          position.tokenX.decimals,
          position.tokenY.decimals
        )

        const valueX = tokenXLiq + tokenYLiq / currentPrice
        const valueY = tokenYLiq + tokenXLiq * currentPrice

        const { usdValue, isClaimAvailable } = calculateUnclaimedFees(position)
        return {
          tokenXName: position.tokenX.symbol,
          tokenYName: position.tokenY.symbol,
          tokenXIcon: position.tokenX.logoURI,
          tokenYIcon: position.tokenY.logoURI,
          fee: +printBN(position.poolData.fee, DECIMAL - 2),
          min,
          max,
          valueX,
          position,
          valueY,
          poolAddress: position.poolData.address,
          liquidity: position.liquidity,
          poolData: position.poolData,
          address: walletAddress.toString(),
          id: position.id.toString() + '_' + position.pool.toString(),
          isActive: currentPrice >= min && currentPrice <= max,
          currentPrice,
          tokenXLiq,
          tokenYLiq,
          network: currentNetwork,
          isFullRange: position.lowerTickIndex === minTick && position.upperTickIndex === maxTick,
          isLocked: position.isLocked,
          unclaimedFeesInUSD: { value: usdValue, loading: position.ticksLoading, isClaimAvailable }
        }
      }),
    [lockedList, pricesData]
  )
  const handleSnackbar = (message: string, variant: VariantType) => {
    dispatch(
      snackbarsActions.add({
        message: message,
        variant: variant,
        persist: false
      })
    )
  }
  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [dispatch])

  return isConnected ? (
    <Portfolio
      selectedFilters={searchParamsToken.filteredTokens}
      setSelectedFilters={setSearchTokensValue}
      shouldDisable={disabledButton}
      tokensList={tokensList}
      isBalanceLoading={isBalanceLoading}
      handleSnackbar={handleSnackbar}
      initialPage={lastPage}
      setLastPage={setLastPage}
      handleRefresh={handleRefresh}
      onAddPositionClick={() => {
        dispatch(navigationActions.setNavigation({ address: location.pathname }))
        navigate(ROUTES.NEW_POSITION)
      }}
      currentNetwork={currentNetwork}
      data={data}
      lockedData={lockedData}
      loading={isLoading}
      showNoConnected={walletStatus !== Status.Initialized}
      itemsPerPage={POSITIONS_PER_PAGE}
      noConnectedBlockerProps={{
        onConnect: () => {
          dispatch(walletActions.connect(false))
        },
        title: 'Start exploring liquidity pools right now!',
        descCustomText: 'Or, connect your wallet to see existing positions, and create a new one!'
      }}
      length={list.length}
      lockedLength={lockedList.length}
      noInitialPositions={list.length === 0 && lockedList.length === 0}
      handleLockPosition={handleLockPosition}
      handleClosePosition={handleClosePosition}
      handleClaimFee={handleClaimFee}
      positionListAlignment={positionListAlignment}
      setPositionListAlignment={(positionType: LiquidityPools) =>
        dispatch(actions.setPositionListSwitcher(positionType))
      }
      overviewSelectedTab={overviewSelectedTab}
      handleOverviewSwitch={option => dispatch(walletActions.setOverviewSwitch(option))}
    />
  ) : (
    <Grid className={classes.emptyContainer}>
      <EmptyPlaceholder
        newVersion
        themeDark
        style={isSm ? { paddingTop: 8 } : {}}
        roundedCorners={true}
        mainTitle='Wallet is not connected'
        desc='No liquidity positions to show'
        withButton={false}
        connectButton={true}
        onAction2={() => dispatch(walletActions.connect(false))}
      />
    </Grid>
  )
}

export default PortfolioWrapper
