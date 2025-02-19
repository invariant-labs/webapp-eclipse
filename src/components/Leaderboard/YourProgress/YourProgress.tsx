import { Box, Typography, useMediaQuery } from '@mui/material'
import React, { useMemo, useState } from 'react'
import useStyles from './styles'
import { Status } from '@store/reducers/solanaWallet'
import trapezeLeft from '@static/png/trapezeLeft.png'
import trapezeRight from '@static/png/trapezeRight.png'
import trapezeMobileTop from '@static/png/trapezeMobileTop.png'
import trapezeMobileBottom from '@static/png/trapezeMobileBottom.png'
import trapezeBottomRight from '@static/png/trapezeBottomRight.png'
import trapezeBottomLeft from '@static/png/trapezeBottomLeft.png'
import boxModalMiddle from '@static/png/boxMobileMiddle.png'
import { BlurOverlay } from './BlurOverlay'
import { ProgressItem } from './ProgressItem'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { CurrentContentPointsEntry, ITotalEntry } from '@store/reducers/leaderboard'
import { unblurContent } from '@utils/uiUtils'
import { ContentPoints } from './ContentPoints'
import ContentPointsModal from '@components/Modals/ContentPoints/ContentPointsModal'
import { theme } from '@static/theme'

interface YourProgressProps {
  userContentPoints: CurrentContentPointsEntry[] | null
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
  userContentPoints,
  userStats,
  estimated24hPoints,
  isLoadingList,
  totalItems,
  walletStatus
}) => {
  const { classes } = useStyles()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const [contentPointsOpen, setContentPointsOpen] = useState(false)
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

          {isMobile ? (
            <ProgressItem
              background={{
                desktop: trapezeBottomLeft,
                mobile: boxModalMiddle
              }}
              tooltip='Points amount refreshes roughly every 30 minutes.'
              desktopLabelAligment='right'
              label='Total points'
              value={
                userStats
                  ? formatNumberWithCommas(
                      Number(printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(
                        2
                      )
                    )
                  : 0
              }
            />
          ) : (
            <ContentPoints
              background={{
                desktop: trapezeRight,
                mobile: boxModalMiddle
              }}
              setContentPointsOpen={setContentPointsOpen}
              desktopLabelAligment='left'
              label='Content Points'
              value={formatNumberWithCommas(
                (userContentPoints?.reduce((acc, a) => acc + a.points, 0) ?? 0).toString()
              )}
            />
          )}
        </Box>
        <Box className={classes.lowerSection}>
          {!isMobile ? (
            <ProgressItem
              background={{
                desktop: trapezeBottomLeft,
                mobile: boxModalMiddle
              }}
              tooltip='Points amount refreshes roughly every 30 minutes.'
              desktopLabelAligment='right'
              label='Total points'
              value={
                userStats
                  ? formatNumberWithCommas(
                      Number(printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(
                        2
                      )
                    )
                  : 0
              }
            />
          ) : (
            <ContentPoints
              background={{
                desktop: trapezeRight,
                mobile: boxModalMiddle
              }}
              setContentPointsOpen={setContentPointsOpen}
              desktopLabelAligment='left'
              label='Content Points'
              value={formatNumberWithCommas(
                (userContentPoints?.reduce((acc, a) => acc + a.points, 0) ?? 0).toString()
              )}
            />
          )}
          <ProgressItem
            background={{
              desktop: trapezeBottomRight,
              mobile: trapezeMobileBottom
            }}
            desktopLabelAligment='left'
            label='Global rank'
            value={userStats?.rank ?? (isConnected ? totalItems.total + 1 : 0)}
          />
        </Box>
      </Box>
      <ContentPointsModal
        userContentPoints={userContentPoints}
        open={contentPointsOpen}
        handleClose={() => {
          setContentPointsOpen(false)
          unblurContent()
        }}
      />
    </Box>
  )
}
