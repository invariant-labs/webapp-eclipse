import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './styles'
import { Status } from '@store/reducers/solanaWallet'
import trapezeLeft from '@static/png/trapezeLeft.png'
import trapezeRight from '@static/png/trapezeRight.png'
import trapezeMobileTop from '@static/png/trapezeMobileTop.png'
import trapezeMobileBottom from '@static/png/trapezeMobileBottom.png'
import trapezeNewDesktopBottom from '@static/png/trapezeNewDesktopBottom.png'
import boxModalMiddle from '@static/png/boxMobileMiddle.png'
import { BlurOverlay } from './BlurOverlay'
import { ProgressItem } from './ProgressItem'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { ITotalEntry } from '@store/reducers/leaderboard'

interface YourProgressProps {
  userStats: ITotalEntry | null
  estimated24hPoints: BN
  isLoadingList: boolean
  walletStatus: Status
  totalItems: {
    total: number
    swap: number
    lp: number
  }
}

export const YourProgress: React.FC<YourProgressProps> = ({
  userStats,
  estimated24hPoints,
  isLoadingList,
  totalItems,
  walletStatus
}) => {
  const { classes } = useStyles()

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }

  const pointsPerDayFormat: string | number = isLessThanMinimal(estimated24hPoints)
    ? isConnected && !estimated24hPoints.isZero()
      ? '<0.01'
      : 0
    : removeAdditionalDecimals(
        formatNumberWithCommas(printBN(estimated24hPoints, LEADERBOARD_DECIMAL)),
        2
      )

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
            value={userStats?.rank ?? (isConnected ? totalItems.total + 1 : 0)}
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
                    Number(printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
                  )
                : 0
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
