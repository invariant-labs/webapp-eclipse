import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { colors, theme } from '@static/theme'
import { ProgressBar } from '@common/ProgressBar/ProgressBar'
import React from 'react'
import { InvtConvertedData } from '@store/consts/types'

interface StatsLocker {
  statsData: InvtConvertedData
  userLockedInvt: number
}
export const StatsLocker: React.FC<StatsLocker> = ({ statsData, userLockedInvt }) => {
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
              {statsData.currentStakeInfo.statsYieldPercentage.toFixed(2)} %
            </Typography>
          </Box>
        </Box>
        <Box className={classes.yourStatsBoxesWrapper}>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Total INVT staked</Typography>
            <Typography component='h2'>
              {statsData.currentStakeInfo.totalInvtStaked || 0}
            </Typography>
          </Box>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Deposit limit</Typography>
            <Typography component='h2'>3M INVT</Typography>
          </Box>
        </Box>
        <Box mt='auto' mb='auto'>
          <Typography component='h3' color={colors.invariant.textGrey}>
            Total INVT deposit
          </Typography>
          <ProgressBar
            percentage={statsData.currentStakeInfo.invtDepositFilledPercentage}
            gap={1}
          />
        </Box>
        {!isSm && (
          <>
            <Typography component='h5' mt={'auto'}>
              Your Stats
            </Typography>

            <Box className={classes.yourStatsBoxesWrapper} flexDirection={'column'}>
              <Box className={classes.singleBoxStat}>
                <Typography component='h3'>Your INVT staked</Typography>
                <Typography component='h2'>{userLockedInvt} INVT</Typography>
              </Box>
              <Box className={classes.singleBoxStat}>
                <Typography component='h3'>Your predicted income</Typography>
                <Typography component='h2'>
                  {statsData.currentStakeInfo.rewardPerToken * userLockedInvt + userLockedInvt} INVT
                </Typography>
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
              <Typography component='h2'>{userLockedInvt} INVT</Typography>
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
