import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { Separator } from '@common/Separator/Separator'
import { colors, theme } from '@static/theme'
import { ProgressBar } from '@common/ProgressBar/ProgressBar'
import React from 'react'

interface StatsLocker {
  percentage: number
  threeMonthsYield: string
  totalStaked: string
  yourStaked: string
  yourShare: string
}
export const StatsLocker: React.FC<StatsLocker> = ({
  percentage,
  threeMonthsYield,
  totalStaked,
  yourStaked,
  yourShare
}) => {
  const { classes } = useStyles()
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const WrapperComponent = isSm ? Grid : React.Fragment
  const wrapperProps = isSm ? { className: classes.wrapper } : {}
  return (
    <WrapperComponent {...wrapperProps}>
      {isSm && <Typography component='h5'>Global Stats</Typography>}
      <Box className={classes.statsWrapper}>
        <Grid className={classes.titleWrapper}>
          <Typography component='h5'>Global Stats</Typography>
          <Box className={classes.lockPeriod}>
            <Typography component='span' color={colors.invariant.textGrey}>
              3 months yield:{' '}
            </Typography>
            <Typography color={colors.invariant.green}>{threeMonthsYield}%</Typography>
          </Box>
        </Grid>
        <Box className={classes.yourStatsBoxesWrapper} mb={'auto'}>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Total INVT staked</Typography>
            <Typography component='h2'>{totalStaked}</Typography>
          </Box>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Deposit limit</Typography>
            <Typography component='h2'>3M INVT</Typography>
          </Box>
        </Box>
        <ProgressBar percentage={percentage} />

        {!isSm && <Separator isHorizontal color={colors.invariant.light} size={'100%'} width={1} />}

        {!isSm && (
          <>
            <Typography component='h5' mt={'auto'}>
              Your Stats
            </Typography>
            <Box className={classes.singleBoxStat}>
              <Typography component='h3'>Your INVT staked</Typography>
              <Typography component='h2'>{yourStaked} INVT</Typography>
            </Box>
            <Box className={classes.yourStatsBoxesWrapper}>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Your share</Typography>
                <Typography component='h2'>{yourShare}%</Typography>
              </Box>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Lock period</Typography>
                <Typography component='h2'>3 months</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {isSm && (
        <Box className={classes.mobileStatsWrapper}>
          <Typography component='h5' mt={'auto'}>
            Your Stats
          </Typography>
          <Box className={classes.statsWrapper}>
            <Box className={classes.singleBoxStat}>
              <Typography component='h3'>Your INVT staked</Typography>
              <Typography component='h2'>{yourStaked} INVT</Typography>
            </Box>
            <Box className={classes.yourStatsBoxesWrapper}>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Your share</Typography>
                <Typography component='h2'>{yourShare}%</Typography>
              </Box>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Lock period</Typography>
                <Typography component='h2'>3 months</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </WrapperComponent>
  )
}
