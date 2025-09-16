import { Box, Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { colors, theme } from '@static/theme'
import { ProgressBar } from '@common/ProgressBar/ProgressBar'
import React from 'react'
import { InvtConvertedData } from '@store/consts/types'
import { formatNumberWithSuffix, trimZeros } from '@utils/utils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { infoIcon } from '@static/icons'

interface StatsLocker {
  statsData: InvtConvertedData
  userLockedInvt: number
  loading: boolean
}
export const StatsLocker: React.FC<StatsLocker> = ({ statsData, userLockedInvt, loading }) => {
  const { classes } = useStyles()

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const WrapperComponent = isSm ? Grid : React.Fragment
  const wrapperProps = isSm ? { className: classes.wrapper } : {}
  return (
    <WrapperComponent {...wrapperProps}>
      {isSm && <Typography component='h5'>Global Stats</Typography>}
      <Box className={classes.statsWrapper}>
        {!isSm && (
          <Grid className={classes.titleWrapper}>
            <Typography component='h5'>Global Stats</Typography>
          </Grid>
        )}
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
            <Box display='flex' alignItems='center' gap={0.5}>
              <Typography component='h3' color={colors.invariant.textGrey}>
                3 months yield{' '}
              </Typography>
              <TooltipHover
                title={
                  'Current yield is all rewards proportionally distributed among all locked INVT'
                }
                increasePadding>
                <img src={infoIcon} alt='i' width={14} />
              </TooltipHover>
            </Box>
            {loading ? (
              <Skeleton height={32} width={125} variant='rounded' sx={{ borderRadius: '8px' }} />
            ) : (
              <Typography style={{ color: colors.invariant.green }} component='h2'>
                {trimZeros(statsData.currentStakeInfo.statsYieldPercentage.toFixed(2))}%
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={classes.yourStatsBoxesWrapper}>
          <Box className={classes.statsBox}>
            <Typography component='h3'>Total INVT deposit</Typography>
            {loading ? (
              <Skeleton height={32} width={125} variant='rounded' sx={{ borderRadius: '8px' }} />
            ) : (
              <Typography component='h2'>
                {statsData.currentStakeInfo.totalInvtStaked || 0}
              </Typography>
            )}
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
            loading={loading}
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
                {loading ? (
                  <Skeleton
                    height={32}
                    width={125}
                    variant='rounded'
                    sx={{ borderRadius: '8px' }}
                  />
                ) : (
                  <Typography component='h2'>{userLockedInvt} INVT</Typography>
                )}
              </Box>
              <Box className={classes.singleBoxStat}>
                <Typography component='h3'>Your predicted income </Typography>
                {loading ? (
                  <Skeleton
                    height={32}
                    width={125}
                    variant='rounded'
                    sx={{ borderRadius: '8px' }}
                  />
                ) : (
                  <Typography component='h2'>
                    {formatNumberWithSuffix(
                      statsData.currentStakeInfo.rewardPerToken * userLockedInvt + userLockedInvt
                    )}{' '}
                    INVT
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {isSm && (
        <Box className={classes.mobileStatsWrapper}>
          <Typography component='h5'>Your Stats</Typography>
          <Box className={classes.statsWrapper}>
            <Box className={classes.globalStatsBox}>
              <Typography component='h3'>Your INVT staked</Typography>
              {loading ? (
                <Skeleton height={30} width={125} variant='rounded' sx={{ borderRadius: '8px' }} />
              ) : (
                <Typography component='h2'>{userLockedInvt} INVT</Typography>
              )}
            </Box>
            <Box className={classes.yourStatsBoxesWrapper}>
              <Box className={classes.globalStatsBox}>
                <Typography component='h3'>Your predicted income </Typography>
                {loading ? (
                  <Skeleton
                    height={30}
                    width={125}
                    variant='rounded'
                    sx={{ borderRadius: '8px' }}
                  />
                ) : (
                  <Typography component='h2'>
                    {formatNumberWithSuffix(
                      statsData.currentStakeInfo.rewardPerToken * userLockedInvt + userLockedInvt
                    )}{' '}
                    INVT
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </WrapperComponent>
  )
}
