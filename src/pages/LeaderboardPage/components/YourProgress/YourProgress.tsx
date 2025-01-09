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
import trapezeNewDesktopBottom from '@static/png/trapezeNewDesktopBottom.png'
import boxModalMiddle from '@static/png/boxMobileMiddle.png'

import { useSelector } from 'react-redux'
import { BlurOverlay } from './BlurOverlay'
import { ProgressItem } from './ProgressItem'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'

interface YourProgressProps {
  userStats: UserStats | null
  estimated24hPoints: BN
  isLoadingList: boolean
}

export const YourProgress: React.FC<YourProgressProps> = ({
  userStats,
  estimated24hPoints,
  isLoadingList
}) => {
  const { classes } = useStyles()
  const walletStatus = useSelector(status)
  const totalItems = useSelector(leaderboardSelectors.totalItems)

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  // const formatUserPoints = (points?: string) => {
  //   if (!userStats) return '0'

  //   try {
  //     if (!points) return '0'

  //     const pointsBN = new BN(points, 'hex')

  //     if (pointsBN.isZero()) return '0'

  //     return formatNumberWithCommas(printBN(pointsBN, LEADERBOARD_DECIMAL))
  //   } catch (error) {
  //     console.error('Error formatting points:', error)
  //     return '0'
  //   }
  // }
  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }

  const pointsPerDayFormat: string | number = userStats
    ? isLessThanMinimal(estimated24hPoints)
      ? '<0.01'
      : removeAdditionalDecimals(
          formatNumberWithCommas(printBN(estimated24hPoints, LEADERBOARD_DECIMAL)),
          2
        )
    : 0

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
      <Box style={{ position: 'relative' }}>
        <BlurOverlay isConnected={isConnected} />
        <Box className={classes.sectionContent}>
          <ProgressItem
            background={{
              desktop: trapezeLeft,
              mobile: trapezeMobileTop
            }}
            desktopLabelAligment='right'
            label='Points Per Day'
            isLoading={isLoadingList}
            value={pointsPerDayFormat}
          />

          <ProgressItem
            background={{
              desktop: trapezeRight,
              mobile: boxModalMiddle
            }}
            blockHeight={{
              mobile: '90px'
            }}
            desktopLabelAligment='left'
            label='Global rank'
            value={userStats?.rank ?? (isConnected ? totalItems + 1 : 0)}
          />
        </Box>
        <Box sx={{ marginTop: '24px' }}>
          <ProgressItem
            background={{
              desktop: trapezeNewDesktopBottom,
              mobile: trapezeMobileBottom
            }}
            blockHeight={{
              desktop: '89px'
            }}
            tooltip='Points amount refreshes roughly every 30 minutes.'
            desktopLabelAligment='center'
            isWideBlock
            label='Total points'
            value={
              userStats
                ? formatNumberWithCommas(
                    printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)
                  )
                : 0
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
