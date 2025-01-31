import {
  Autocomplete,
  Fade,
  Chip,
  Grid,
  InputAdornment,
  InputBase,
  Typography,
  Paper,
  Box
} from '@mui/material'
import {
  isLoading,
  poolsStatsWithTokensDetails,
  tokensStatsWithTokensDetails
} from '@store/selectors/stats'
import React, { forwardRef, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SearchIcon from '@static/svg/lupaDark.svg'
import useStyles from './styles'
import icons from '@static/icons'
import { VariantType } from 'notistack'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { network } from '@store/selectors/solanaConnection'
import { actions } from '@store/reducers/stats'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import LiquidityPoolList from '@components/LiquidityPoolList/LiquidityPoolList'
import { getPromotedPools } from '@store/selectors/leaderboard'
import { shortenAddress } from '@utils/uiUtils'

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
  const [open, setOpen] = useState<boolean>(false)

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

  function PaperComponent(paperProps, ref) {
    return (
      <Fade in>
        <Paper {...paperProps} ref={ref} />
      </Fade>
    )
  }
  const PaperComponentForward = forwardRef(PaperComponent)

  return (
    <div className={classes.container}>
      <Grid
        display='flex'
        alignItems='end'
        justifyContent='space-between'
        className={classes.rowContainer}>
        <Typography className={classes.subheader} mb={2}>
          All pools
        </Typography>

        <Autocomplete
          multiple
          PaperComponent={PaperComponentForward}
          classes={{ paper: classes.paper }}
          id='token-selector'
          options={mappedTokens}
          getOptionLabel={option => option.symbol}
          value={selectedTokens}
          onChange={(_, newValue) => {
            if (newValue.length <= 2) {
              setSelectedTokens(newValue)
            }
          }}
          onOpen={() => {
            if (selectedTokens.length < 2) setOpen(true)
          }}
          onClose={() => setOpen(false)}
          open={open}
          disableClearable
          popupIcon={null}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option.symbol} {...getTagProps({ index })} />)
          }
          renderOption={(props, option) => (
            <Box component='li' {...props}>
              <img
                src={option.icon}
                alt={option.symbol}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <Typography>{shortenAddress(option.symbol)}</Typography>
            </Box>
          )}
          renderInput={params => (
            <InputBase
              {...params.InputProps}
              type='text'
              className={classes.searchBar}
              placeholder={!selectedTokens.length ? 'Select token' : ''}
              endAdornment={
                <InputAdornment position='end'>
                  <img src={SearchIcon} className={classes.searchIcon} alt='Search' />
                </InputAdornment>
              }
              inputProps={{ ...params.inputProps, readOnly: selectedTokens.length >= 2 }}
              onClick={() => {
                if (selectedTokens.length < 2) setOpen(true)
              }}
            />
          )}
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
