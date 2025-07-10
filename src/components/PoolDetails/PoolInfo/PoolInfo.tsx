import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import InfoUpperSection from './InfoUpperSection/InfoUpperSection'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'

import PercentageScale from './PercentageScale/PercentageScale'

export interface IPros {
  interval: IntervalsKeys
  statsPoolData: PoolSnap
  isLoadingStats: boolean
}

export const PoolInfo: React.FC<IPros> = ({ interval, statsPoolData, isLoadingStats }) => {
  const { classes, cx } = useStyles()

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
        <PercentageScale />
      </Grid>
    </Grid>
  )
}

export default PoolInfo
