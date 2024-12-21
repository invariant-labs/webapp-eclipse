import { Box, Typography } from '@mui/material'
import { UserStats } from '@store/reducers/leaderboard'
import React, { useMemo } from 'react'
import useStyles from './styles'

import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'

import trapezeLeft from '@static/png/trapezeLeft.png'
import trapezeRight from '@static/png/trapezeRight.png'

import trapezeMobileTop from '@static/png/trapezeMobileTop.png'
import trapezeMobileBottom from '@static/png/trapezeMobileBottom.png'

import { useSelector } from 'react-redux'
import { BlurOverlay } from './BlurOverlay'
import { ProgressItem } from './ProgressItem'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'
import { formatNumberWithCommas, printBN } from '@utils/utils'

interface YourProgressProps {
  userStats: UserStats | null
}

export const YourProgress: React.FC<YourProgressProps> = ({ userStats }) => {
  const { classes } = useStyles()
  const walletStatus = useSelector(status)
  const totalItems = useSelector(leaderboardSelectors.totalItems)

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '24px',
        width: '100%'
      }}>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Your Progress</Typography>

      <Box className={classes.sectionContent} style={{ position: 'relative' }}>
        <BlurOverlay isConnected={isConnected} />
        <ProgressItem
          background={{
            dekstop: trapezeLeft,
            mobile: trapezeMobileTop
          }}
          tooltip='Points amount refreshes roughly every 30 minutes.'
          desktopLabelAligment='right'
          label='Total points'
          value={
            userStats
              ? formatNumberWithCommas(
                  printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)
                )
              : 0
          }
        />
        <ProgressItem
          background={{
            dekstop: trapezeRight,
            mobile: trapezeMobileBottom
          }}
          desktopLabelAligment='left'
          label='Global rank'
          value={userStats?.rank ?? (isConnected ? totalItems + 1 : 0)}
        />
      </Box>
    </Box>
  )
}
