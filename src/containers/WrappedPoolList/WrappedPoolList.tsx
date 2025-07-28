import { isLoading, lastInterval, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { unknownTokenIcon } from '@static/icons'
import { VariantType } from 'notistack'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { network } from '@store/selectors/solanaConnection'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions as navigationActions } from '@store/reducers/navigation'
import { getPromotedPools } from '@store/selectors/leaderboard'
import { ISearchToken } from '@common/FilterSearch/FilterSearch'
import { Intervals } from '@store/consts/static'
import {
  liquiditySearch,
  showFavourites as showFavouritesSelector
} from '@store/selectors/navigation'
import PoolList from '@components/Stats/PoolList/PoolList'

export const WrappedPoolList: React.FC = () => {
  const dispatch = useDispatch()

  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const networkType = useSelector(network)
  const promotedPools = useSelector(getPromotedPools)
  const currentNetwork = useSelector(network)
  const searchParams = useSelector(liquiditySearch)
  const isLoadingStats = useSelector(isLoading)

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

  const handleFavouritesClick = () => {
    setShowFavourites(!showFavourites)
    dispatch(
      navigationActions.setSearch({
        section: 'liquidityPool',
        type: 'pageNumber',
        pageNumber: 1
      })
    )
  }

  return (
    <PoolList
      initialLength={poolsList.length}
      interval={lastFetchedInterval || Intervals.Daily}
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
      network={currentNetwork}
      copyAddressHandler={copyAddressHandler}
      isLoading={isLoadingStats}
      showAPY={showAPY}
      filteredTokens={selectedFilters}
      switchFavouritePool={switchFavouritePool}
      showFavourites={showFavourites}
      handleFavouritesClick={handleFavouritesClick}
      setSearchPoolsValue={setSelectedFilters}
      searchPoolsValue={selectedFilters}
    />
  )
}
