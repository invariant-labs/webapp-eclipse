import React, { useMemo } from 'react'
import { Dialog, DialogContent, Box, Typography, Button } from '@mui/material'
import { FixedSizeList } from 'react-window'
import useStyles from './style'
import { formatDate, formatNumberWithSpaces, generateTwoWeekRangesUpToToday } from '@utils/utils'
import { PROGRAM_START } from '@store/consts/static'

export interface CurrentContentPointsEntry {
  startTimestamp: number
  endTimestamp: number
  points: number
}

export interface IContentPointsModal {
  open: boolean
  userContentPoints: CurrentContentPointsEntry[] | null
  handleClose: () => void
}

export interface Interval {
  startTimestamp: number
  endTimestamp: number
}

interface IntervalWithPoints extends Interval {
  points: number
  isCurrent: boolean
}

export const ContentPointsModal: React.FC<IContentPointsModal> = ({
  open,
  handleClose,
  userContentPoints
}) => {
  const { classes } = useStyles()

  const nowInSeconds = Math.floor(Date.now() / 1000)

  const safeUserContentPoints = userContentPoints ?? []

  const twoWeekRanges: Interval[] = useMemo(() => generateTwoWeekRangesUpToToday(PROGRAM_START), [])

  const intervalsWithPoints: IntervalWithPoints[] = useMemo(() => {
    return twoWeekRanges.map(range => {
      const matchingEntries = safeUserContentPoints.filter(
        entry =>
          entry.startTimestamp < range.endTimestamp && entry.endTimestamp > range.startTimestamp
      )

      const totalPoints = matchingEntries.reduce((sum, entry) => sum + entry.points, 0)

      const isCurrent = nowInSeconds >= range.startTimestamp && nowInSeconds < range.endTimestamp

      return {
        ...range,
        points: totalPoints,
        isCurrent
      }
    })
  }, [twoWeekRanges, safeUserContentPoints, nowInSeconds])

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = intervalsWithPoints[index]

    return (
      <Box key={index} style={style} className={classes.row}>
        <Box className={classes.innerRow}>
          <Typography className={classes.dateLabel}>
            {formatDate(entry.startTimestamp)} - {formatDate(entry.endTimestamp)}
          </Typography>

          {entry.isCurrent ? (
            <Button
              component='a'
              href='https://docs.google.com/forms/d/e/1FAIpQLSe9fziOpaFeSj8fCEZWnKm5DHON2gqGeEM771s8tldihfBZUw/viewform'
              target='_blank'
              rel='noopener noreferrer'
              className={classes.button}>
              Submit here
            </Button>
          ) : (
            <Typography className={classes.pointsLabel}>
              + {formatNumberWithSpaces(entry.points.toString())} Points
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ className: classes.paper }} fullWidth>
      <Box className={classes.lockPositionHeader}>
        <Typography component='h1'>Content Points Allocations</Typography>
        <Button className={classes.lockPositionClose} onClick={handleClose} aria-label='Close' />
      </Box>
      <Box className={classes.description}>
        <Typography>
          View your points allocations history for the{' '}
          <a
            href='https://docs.invariant.app/docs/invariant_points/content'
            target='_blank'
            rel='noopener noreferrer'
            className={classes.link}>
            Content Program
          </a>
        </Typography>
      </Box>

      <DialogContent sx={{ padding: 0 }}>
        <Box>
          <Typography className={classes.allocationText}>Your allocations</Typography>
          <FixedSizeList
            height={200}
            width='100%'
            itemSize={56}
            itemCount={intervalsWithPoints.length}
            className={classes.allocationSection}>
            {Row}
          </FixedSizeList>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ContentPointsModal
