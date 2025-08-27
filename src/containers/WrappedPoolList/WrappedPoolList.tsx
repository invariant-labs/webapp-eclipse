import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import { isLoading, lastInterval, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useStyles from './styles'
import { star, starFill, unknownTokenIcon } from '@static/icons'
import { VariantType } from 'notistack'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { network } from '@store/selectors/solanaConnection'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as navigationActions } from '@store/reducers/navigation'
import LiquidityPoolList from '@components/LiquidityPoolList/LiquidityPoolList'
import { getPromotedPools } from '@store/selectors/leaderboard'

import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import { theme } from '@static/theme'
import { Intervals } from '@store/consts/static'
import {
  liquiditySearch,
  showFavourites as showFavouritesSelector
} from '@store/selectors/navigation'

export const WrappedPoolList: React.FC = () => {
  const dispatch = useDispatch()

  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const networkType = useSelector(network)
  const promotedPools = useSelector(getPromotedPools)
  const currentNetwork = useSelector(network)
  const searchParams = useSelector(liquiditySearch)
  const isLoadingStats = useSelector(isLoading)
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const { classes } = useStyles({ isXs })

  const selectedFilters = searchParams.filteredTokens
  const setSelectedFilters = (tokens: ISearchToken[]) => {
    dispatch(
      navigationActions.setSearch({
        section: 'liquidityPool',
        type: 'filteredTokens',
        filteredTokens: tokens
      })
    )
    dispatch(
      navigationActions.setSearch({
        section: 'liquidityPool',
        type: 'pageNumber',
        pageNumber: 1
      })
    )
  }

  const lastFetchedInterval = useSelector(lastInterval)

  const [favouritePools, setFavouritePools] = useState<Set<string>>(
    new Set(
      JSON.parse(localStorage.getItem(`INVARIANT_FAVOURITE_POOLS_Eclipse_${networkType}`) || '[]')
    )
  )
  const showFavourites = useSelector(showFavouritesSelector)

  const setShowFavourites = (show: boolean) => {
    dispatch(navigationActions.setShowFavourites(show))
  }

  useEffect(() => {
    localStorage.setItem(
      `INVARIANT_FAVOURITE_POOLS_Eclipse_${networkType}`,
      JSON.stringify([...favouritePools])
    )
  }, [favouritePools])

  const switchFavouritePool = (poolAddress: string) => {
    if (favouritePools.has(poolAddress)) {
      const updatedFavouritePools = new Set(favouritePools)
      updatedFavouritePools.delete(poolAddress)
      setFavouritePools(updatedFavouritePools)
    } else {
      const updatedFavouritePools = new Set(favouritePools)
      updatedFavouritePools.add(poolAddress)
      setFavouritePools(updatedFavouritePools)
    }
  }

  const filteredPoolsList = useMemo(() => {
    const poolsListWithFavourites = poolsList.map(poolData => ({
      ...poolData,
      isFavourite: favouritePools.has(poolData.poolAddress.toString())
    }))

    return poolsListWithFavourites.filter(poolData => {
      if (showFavourites) {
        if (!poolData.isFavourite) return false
      }

      const isTokenXSelected = selectedFilters.some(
        token => token.address.toString() === poolData.tokenX.toString()
      )
      const isTokenYSelected = selectedFilters.some(
        token => token.address.toString() === poolData.tokenY.toString()
      )

      if (selectedFilters.length === 1) {
        return isTokenXSelected || isTokenYSelected
      }

      if (selectedFilters.length === 2) {
        if (!(isTokenXSelected && isTokenYSelected)) return false
      }

      return true
    })
  }, [isLoadingStats, poolsList, selectedFilters, favouritePools, showFavourites])

  const showAPY = useMemo(() => {
    return filteredPoolsList.some(pool => pool.apy !== 0)
  }, [filteredPoolsList])

  const copyAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  return (
    <div className={classes.container}>
      <Box className={classes.rowContainer}>
        <Typography className={classes.subheader} mb={2}>
          All pools
        </Typography>

        <Box className={classes.headerContainer}>
          <Button
            className={classes.showFavouritesButton}
            onClick={() => {
              setShowFavourites(!showFavourites)
              dispatch(
                navigationActions.setSearch({
                  section: 'liquidityPool',
                  type: 'pageNumber',
                  pageNumber: 1
                })
              )
            }}>
            <img src={showFavourites ? starFill : star} />
            {!isMd && (
              <Typography className={classes.showFavouritesText}>
                {!showFavourites ? 'Show' : 'Hide'} favourites
              </Typography>
            )}
          </Button>

          <FilterSearch
            networkType={networkType}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            filtersAmount={2}
          />
        </Box>
      </Box>
      <LiquidityPoolList
        data={filteredPoolsList.map(poolData => ({
          symbolFrom: poolData.tokenXDetails?.symbol ?? poolData.tokenX.toString(),
          symbolTo: poolData.tokenYDetails?.symbol ?? poolData.tokenY.toString(),
          iconFrom: poolData.tokenXDetails?.logoURI ?? unknownTokenIcon,
          iconTo: poolData.tokenYDetails?.logoURI ?? unknownTokenIcon,
          volume: poolData.volume24,
          TVL: poolData.tvl,
          fee: poolData.fee,
          addressFrom: poolData.tokenX.toString(),
          addressTo: poolData.tokenY.toString(),
          apy: poolData.apy,
          lockedX: poolData.lockedX,
          lockedY: poolData.lockedY,
          liquidityX: poolData.liquidityX,
          liquidityY: poolData.liquidityY,
          apyData: {
            fees: poolData.apy,
            accumulatedFarmsSingleTick: 0,
            accumulatedFarmsAvg: 0
          },
          isUnknownFrom: poolData.tokenXDetails?.isUnknown ?? false,
          isUnknownTo: poolData.tokenYDetails?.isUnknown ?? false,
          poolAddress: poolData.poolAddress.toString(),
          pointsPerSecond:
            promotedPools.find(pool => pool.address === poolData.poolAddress.toString())
              ?.pointsPerSecond || '0',
          isPromoted: promotedPools.some(pool => pool.address === poolData.poolAddress.toString()),
          isFavourite: poolData.isFavourite
        }))}
        initialLength={poolsList.length}
        network={currentNetwork}
        copyAddressHandler={copyAddressHandler}
        isLoading={isLoadingStats}
        showAPY={showAPY}
        filteredTokens={selectedFilters}
        interval={lastFetchedInterval || Intervals.Daily}
        switchFavouritePool={switchFavouritePool}
        showFavourites={showFavourites}
      />
    </div>
  )
}
