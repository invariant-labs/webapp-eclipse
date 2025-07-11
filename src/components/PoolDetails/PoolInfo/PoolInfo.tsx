import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import InfoUpperSection from './InfoUpperSection/InfoUpperSection'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys, NetworkType } from '@store/consts/static'
import PercentageScale from './PercentageScale/PercentageScale'
import { SwapToken } from '@store/selectors/solanaWallet'
import { TokenReserve } from '@store/consts/types'
import TokenInfo from './TokenInfo/TokenInfo'
import { VariantType } from 'notistack'

export interface IPros {
  interval: IntervalsKeys
  statsPoolData: PoolSnap
  isLoadingStats: boolean
  tokenX: SwapToken | null
  tokenY: SwapToken | null
  tokenXReserve: TokenReserve | null
  tokenYReserve: TokenReserve | null
  prices: { tokenX: number; tokenY: number }
  copyAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
}

export const PoolInfo: React.FC<IPros> = ({
  interval,
  statsPoolData,
  isLoadingStats,
  tokenX,
  tokenY,
  tokenXReserve,
  tokenYReserve,
  prices,
  copyAddressHandler,
  network
}) => {
  const { classes } = useStyles()
  const tokenXUsdAmount = tokenXReserve ? prices.tokenX * tokenXReserve.uiAmount : 0
  const tokenYUsdAmount = tokenYReserve ? prices.tokenY * tokenYReserve.uiAmount : 0

  const [tokenXPercentage, tokenYPercentage] = React.useMemo(() => {
    if (!tokenX || !tokenY || !tokenXReserve || !tokenYReserve) return [0, 0]

    const tokenXPercentage = (tokenXUsdAmount / (tokenXUsdAmount + tokenYUsdAmount)) * 100
    const tokenYPercentage = (tokenYUsdAmount / (tokenXUsdAmount + tokenYUsdAmount)) * 100

    return [tokenXPercentage, tokenYPercentage]
  }, [tokenX, tokenY, tokenXReserve, tokenYReserve, prices])

  if (!tokenX || !tokenY) return null

  return (
    <Grid className={classes.wrapper}>
      <Typography className={classes.header}>Pool Info</Typography>
      <Grid className={classes.container}>
        <InfoUpperSection
          interval={interval}
          statsPoolData={statsPoolData}
          isLoadingStats={isLoadingStats}
        />
        <Box className={classes.separator} />

        <PercentageScale
          tokenX={tokenX}
          tokenY={tokenY}
          tokenXPercentage={tokenXPercentage}
          tokenYPercentage={tokenYPercentage}
        />
        <Box display='flex' gap='20px' flexDirection='column' mt={'20px'}>
          <TokenInfo
            token={tokenX}
            copyAddressHandler={copyAddressHandler}
            network={network}
            amount={tokenXReserve?.uiAmount}
            price={prices.tokenX}
          />
          <TokenInfo
            token={tokenY}
            copyAddressHandler={copyAddressHandler}
            network={network}
            amount={tokenYReserve?.uiAmount}
            price={prices.tokenY}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default PoolInfo
