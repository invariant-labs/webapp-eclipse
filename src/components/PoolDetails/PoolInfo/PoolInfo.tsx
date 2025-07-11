import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import InfoUpperSection from './InfoUpperSection/InfoUpperSection'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'

import PercentageScale from './PercentageScale/PercentageScale'
import { SwapToken } from '@store/selectors/solanaWallet'
import { TokenReserve } from '@store/consts/types'

export interface IPros {
  interval: IntervalsKeys
  statsPoolData: PoolSnap
  isLoadingStats: boolean
  tokenA: SwapToken | null
  tokenB: SwapToken | null
  tokenAReserve: TokenReserve | null
  tokenBReserve: TokenReserve | null
  prices: { tokenA: number; tokenB: number }
}

export const PoolInfo: React.FC<IPros> = ({
  interval,
  statsPoolData,
  isLoadingStats,
  tokenA,
  tokenB,
  tokenAReserve,
  tokenBReserve,
  prices
}) => {
  const { classes, cx } = useStyles()
  const tokenAUsdAmount = tokenAReserve ? prices.tokenA * tokenAReserve.uiAmount : 0
  const tokenBUsdAmount = tokenBReserve ? prices.tokenB * tokenBReserve.uiAmount : 0
  console.log(prices.tokenA)

  const [tokenAPercentage, tokenBPercentage] = React.useMemo(() => {
    if (!tokenA || !tokenB || !tokenAReserve || !tokenBReserve) return [0, 0]

    const tokenAPercentage = (tokenAUsdAmount / (tokenAUsdAmount + tokenBUsdAmount)) * 100
    const tokenBPercentage = (tokenBUsdAmount / (tokenAUsdAmount + tokenBUsdAmount)) * 100

    return [tokenAPercentage, tokenBPercentage]
  }, [tokenA, tokenB, tokenAReserve, tokenBReserve, prices])

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
        {tokenA && tokenB && (
          <PercentageScale
            tokenA={tokenA}
            tokenB={tokenB}
            tokenAPercentage={tokenAPercentage}
            tokenBPercentage={tokenBPercentage}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default PoolInfo
