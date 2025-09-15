import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { colors, theme, typography } from '@static/theme'
import { ProgressBar } from '@common/ProgressBar/ProgressBar'
import React, { useMemo } from 'react'
import { Timer } from '@common/Timer/Timer'
import { useCountdown } from '@common/Timer/useCountdown'
import { BN } from '@coral-xyz/anchor'

interface StatsLocker {
  percentage: number
  threeMonthsYield: string
  totalStaked: string
  yourStaked: string
  startTimestamp: BN
}
export const StatsLocker: React.FC<StatsLocker> = ({
  percentage,
  threeMonthsYield,
  totalStaked,
  yourStaked,
  startTimestamp
}) => {
  const { classes } = useStyles()
  const targetDate = useMemo(() => new Date(startTimestamp.toNumber() * 1000), [startTimestamp])
  const { hours, minutes, seconds } = useCountdown({
    targetDate
  })

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const WrapperComponent = isSm ? Grid : React.Fragment
  const wrapperProps = isSm ? { className: classes.wrapper } : {}
  return (
    <WrapperComponent {...wrapperProps}>
      {isSm && <Typography component='h5'>Global Stats</Typography>}
      <Box className={classes.statsWrapper}>
        <Box display='flex' gap={0} flexDirection='column'>
          <Box className={classes.timerWrapper}>
            <Typography sx={{ color: colors.invariant.text, ...typography.body1 }}>
              Lock ends in
            </Typography>
            <Timer hours={hours} minutes={minutes} seconds={seconds} isSmall width={130} />
          </Box>
        </Box>
        <Grid className={classes.titleWrapper}>
          <Typography component='h5'>Global Stats</Typography>
        </Grid>
        <Box className={classes.yourStatsBoxesWrapper} mt={'auto'}>
          <Box className={classes.statsBox}>
            <Typography component='h3' color={colors.invariant.textGrey}>
              Rewards
            </Typography>
            <Typography
              style={{ color: colors.invariant.green }}
              className={classes.greenText}
              component='h2'>
              1,5M INVT
            </Typography>
          </Box>
          <Box className={classes.statsBox}>
            <Typography component='h3' color={colors.invariant.textGrey}>
              3 months yield:{' '}
            </Typography>
            <Typography style={{ color: colors.invariant.green }} component='h2'>
              {threeMonthsYield}%
            </Typography>
          </Box>
        </Box>
        <Box className={classes.yourStatsBoxesWrapper}>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Total INVT staked</Typography>
            <Typography component='h2'>{totalStaked}</Typography>
          </Box>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Deposit limit</Typography>
            <Typography component='h2'>3M INVT</Typography>
          </Box>
        </Box>

        <Box>
          <Typography component='h3' color={colors.invariant.textGrey}>
            Total INVT deposit
          </Typography>
          <ProgressBar percentage={percentage} gap={1} />
        </Box>
        {!isSm && (
          <>
            <Typography component='h5' mt={'auto'}>
              Your Stats
            </Typography>

            <Box className={classes.yourStatsBoxesWrapper} flexDirection={'column'}>
              <Box className={classes.singleBoxStat}>
                <Typography component='h3'>Your INVT staked</Typography>
                <Typography component='h2'>{yourStaked} INVT</Typography>
              </Box>
              <Box className={classes.singleBoxStat}>
                <Typography component='h3'>Your predicted income</Typography>
                <Typography component='h2'>123 INVT</Typography>
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
            <Box className={classes.globalStatsBox}>
              <Typography component='h3'>Your INVT staked</Typography>
              <Typography component='h2'>{yourStaked} INVT</Typography>
            </Box>
            <Box className={classes.yourStatsBoxesWrapper}>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Your predicted income</Typography>
                <Typography component='h2'>123 INVT</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </WrapperComponent>
  )
}
