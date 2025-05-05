import { Box, Grid, Typography } from '@mui/material'
import React, { useState } from 'react'
import useStyles from './styles'
import { ProgressItem } from './ProgressItem'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { CurrentContentPointsEntry, ITotalEntry } from '@store/reducers/leaderboard'
import { unblurContent } from '@utils/uiUtils'
import ContentPointsModal from '@components/Modals/ContentPoints/ContentPointsModal'
import { BlurOverlay } from './BlurOverlay'
import top from '@static/png/trapezeMobileTop.png'
import bot from '@static/png/trapezeMobileBottom.png'
import mid from '@static/png/boxMobileMiddle.png'

interface YourProgressProps {
  userContentPoints: CurrentContentPointsEntry[] | null
  userStats: ITotalEntry | null
  estimated24hPoints: BN
  isLoadingList: boolean
  isConnected: boolean
  totalItems: {
    total: number
    swap: number
    lp: number
  }
  contentProgramDates: { start: string; end: string }
}

export const YourProgress: React.FC<YourProgressProps> = ({
  userContentPoints,
  userStats,
  estimated24hPoints,
  isLoadingList,
  totalItems,
  isConnected,
  contentProgramDates
}) => {
  const { classes } = useStyles({})
  const [contentPointsOpen, setContentPointsOpen] = useState(false)
  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }
  const tooltipContentPoints = (
    <Box sx={{ width: '190px' }}>
      <Typography className={classes.tooltipContentPoints}>
        Earn point allocations for creating content about Invariant on social media! Tweets,
        threads, YouTube videos, TikToks, and articles - all help you accumulate more points.{' '}
        <a
          href='https://docs.invariant.app/docs/invariant_points/content'
          target='_blank'
          rel='noopener noreferrer'
          className={classes.tooltipLink}>
          More details
        </a>
      </Typography>
    </Box>
  )

  const pointsPerDayFormat: string | number = isLessThanMinimal(estimated24hPoints)
    ? isConnected && !estimated24hPoints.isZero()
      ? '<0.01'
      : 0
    : removeAdditionalDecimals(
        formatNumberWithCommas(printBN(estimated24hPoints, LEADERBOARD_DECIMAL)),
        2
      )

  return (
    <Grid className={classes.mainWrapper}>
      <Grid className={classes.boxWrapper}>
        {<BlurOverlay isConnected={isConnected} />}

        <Grid className={classes.header}>
          <Typography>Invariant's Points</Typography>
        </Grid>

        <Grid className={classes.section}>
          <Grid className={classes.pointsContainer}>
            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={top}
                label='Points Per Day'
                isLoading={isLoadingList}
                value={pointsPerDayFormat}
              />
              <ProgressItem
                bgImage={mid}
                isConnected={isConnected}
                isLoading={isLoadingList}
                tooltip={
                  <>
                    Points amount refreshes roughly <br /> up to 2 minutes.
                  </>
                }
                label='Total points'
                value={
                  userStats
                    ? formatNumberWithCommas(
                        Number(
                          printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)
                        ).toFixed(2)
                      )
                    : 0
                }
              />
            </Grid>

            <Grid className={classes.divider} />

            <Grid className={classes.pointsColumn}>
              <ProgressItem
                isConnected={isConnected}
                bgImage={mid}
                withButton={true}
                tooltip={tooltipContentPoints}
                label='Content Points'
                isLoading={isLoadingList}
                onModalOpen={setContentPointsOpen}
                value={formatNumberWithCommas(
                  (userContentPoints?.reduce((acc, a) => acc + a.points, 0) ?? 0).toString()
                )}
              />
              <ProgressItem
                isConnected={isConnected}
                bgImage={bot}
                isLoading={isLoadingList}
                label='Global rank'
                value={userStats?.rank ?? (isConnected ? totalItems.total + 1 : 0)}
              />
            </Grid>
          </Grid>
        </Grid>
        <ContentPointsModal
          userContentPoints={userContentPoints}
          open={contentPointsOpen}
          contentProgramDates={contentProgramDates}
          handleClose={() => {
            setContentPointsOpen(false)
            unblurContent()
          }}
        />
      </Grid>
    </Grid>
  )
}
