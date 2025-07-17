import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import { NetworkType } from '@store/consts/static'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PoolSnap } from '@store/reducers/stats'
import ChartUpperSection from './ChartUpperSection/ChartUpperSection'
import ChartLowerSection from './ChartLowerSection/ChartLowerSection'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { PoolChartSwitch } from '@store/consts/types'
import { VariantType } from 'notistack'
import { select } from 'typed-redux-saga'

export interface IProps {
  poolAddress: string
  copyAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  statsPoolData: PoolSnap
  tokenX: SwapToken | null
  tokenY: SwapToken | null
  handleOpenSwap: () => void
  handleOpenPosition: () => void
  isPoolDataLoading: boolean
  interval: IntervalsKeys
  isLoadingStats: boolean
  lastStatsTimestamp: number
  setChartType: (type: PoolChartSwitch) => void
  updateInterval: (interval: IntervalsKeys) => void
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  currentFee: string
}

export const Chart: React.FC<IProps> = ({
  poolAddress,
  copyAddressHandler,
  network,
  statsPoolData,
  tokenX,
  tokenY,
  handleOpenSwap,
  handleOpenPosition,
  isPoolDataLoading,
  interval,
  isLoadingStats,
  lastStatsTimestamp,
  setChartType,
  updateInterval,
  selectFeeTier,
  feeTiers,
  currentFee
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.wrapper}>
      <Typography className={classes.header}>Chart</Typography>
      <Box className={classes.container}>
        <ChartUpperSection
          copyAddressHandler={copyAddressHandler}
          handleOpenPosition={handleOpenPosition}
          handleOpenSwap={handleOpenSwap}
          isPoolDataLoading={isPoolDataLoading}
          network={network}
          poolAddress={poolAddress}
          tokenX={tokenX}
          tokenY={tokenY}
          selectFeeTier={selectFeeTier}
          feeTiers={feeTiers}
        />
        <Box className={classes.separator} />
        <ChartLowerSection
          statsPoolData={statsPoolData}
          interval={interval}
          isLoading={isLoadingStats}
          lastStatsTimestamp={lastStatsTimestamp}
          setChartType={setChartType}
          updateInterval={updateInterval}
        />
      </Box>
    </Grid>
  )
}

export default Chart
