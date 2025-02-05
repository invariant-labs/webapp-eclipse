import { Grid, Typography } from '@mui/material'
import {
  isLoading,
  poolsStatsWithTokensDetails,
  tokensStatsWithTokensDetails
} from '@store/selectors/stats'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import useStyles from './styles'
import icons from '@static/icons'
import { VariantType } from 'notistack'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { network } from '@store/selectors/solanaConnection'
import { actions } from '@store/reducers/stats'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import LiquidityPoolList from '@components/LiquidityPoolList/LiquidityPoolList'
import { getPromotedPools } from '@store/selectors/leaderboard'

import { FilterSearch } from '@components/FilterSearch/FilterSearch'

interface ISearchToken {
  icon: string
  name: string
  symbol: string
  address: string
}

export const WrappedPoolList: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const tokensList = useSelector(tokensStatsWithTokensDetails)

  const promotedPools = useSelector(getPromotedPools)
  const currentNetwork = useSelector(network)
  const isLoadingStats = useSelector(isLoading)

  const [selectedTokens, setSelectedTokens] = useState<ISearchToken[]>([])

  const filteredPoolsList = useMemo(() => {
    return poolsList.filter(poolData => {
      const isTokenXSelected = selectedTokens.some(
        token => token.address.toString() === poolData.tokenX.toString()
      )
      const isTokenYSelected = selectedTokens.some(
        token => token.address.toString() === poolData.tokenY.toString()
      )

      if (selectedTokens.length === 1) {
        return isTokenXSelected || isTokenYSelected
      }

      if (selectedTokens.length === 2) {
        return isTokenXSelected && isTokenYSelected
      }

      return true
    })
  }, [isLoadingStats, poolsList, selectedTokens])
  useEffect(() => {
    console.log(filteredPoolsList)
  }, [filteredPoolsList])

  const mappedTokens = tokensList.map(tokenData => ({
    icon: tokenData.tokenDetails?.logoURI ?? icons.unknownToken,
    name: tokenData.tokenDetails?.name ?? tokenData.address.toString(),
    symbol: tokenData.tokenDetails?.symbol ?? tokenData.address.toString(),
    address: tokenData.address.toString()
  }))

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
    dispatch(actions.getCurrentStats())
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  return (
    <div className={classes.container}>
      <Grid
        display='flex'
        direction='column'
        alignItems='flex-start'
        justifyContent='start'
        className={classes.rowContainer}>
        <Typography className={classes.subheader} mb={2}>
          All pools
        </Typography>

        <FilterSearch
          selectedTokens={selectedTokens}
          setSelectedTokens={setSelectedTokens}
          mappedTokens={mappedTokens}
        />
      </Grid>
      <LiquidityPoolList
        data={filteredPoolsList.map(poolData => ({
          symbolFrom: poolData.tokenXDetails?.symbol ?? poolData.tokenX.toString(),
          symbolTo: poolData.tokenYDetails?.symbol ?? poolData.tokenY.toString(),
          iconFrom: poolData.tokenXDetails?.logoURI ?? icons.unknownToken,
          iconTo: poolData.tokenYDetails?.logoURI ?? icons.unknownToken,
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
          isPromoted: promotedPools.some(pool => pool.address === poolData.poolAddress.toString())
        }))}
        network={currentNetwork}
        copyAddressHandler={copyAddressHandler}
        isLoading={isLoadingStats}
        showAPY={showAPY}
      />
    </div>
  )
}
