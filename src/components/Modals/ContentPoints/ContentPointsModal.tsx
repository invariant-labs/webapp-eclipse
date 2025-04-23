import React from 'react'
import { Dialog, DialogContent, Box, Typography, Button, useMediaQuery } from '@mui/material'
import { FixedSizeList } from 'react-window'
import useStyles from './style'
import { formatDate, formatNumberWithSpaces } from '@utils/utils'
import { closeSmallIcon } from '@static/icons'
import { theme } from '@static/theme'
import { shortenDate } from '@utils/uiUtils'

export interface CurrentContentPointsEntry {
  startTimestamp: number
  endTimestamp: number
  points: number
}

export interface IContentPointsModal {
  open: boolean
  userContentPoints: CurrentContentPointsEntry[] | null
  handleClose: () => void
  contentProgramDates: { start: string; end: string }
}

export const ContentPointsModal: React.FC<IContentPointsModal> = ({
  open,
  handleClose,
  userContentPoints,
  contentProgramDates
}) => {
  const itemSize = 56
  const allocations = userContentPoints
    ? userContentPoints.slice().sort((a, b) => b.startTimestamp - a.startTimestamp)
    : []
  const isEmpty = allocations.length === 0
  const { classes } = useStyles({ isEmpty })
  const hidePointsLabel = useMediaQuery(theme.breakpoints.down(375))
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = allocations[index]
    return (
      <Box key={index} style={style} className={classes.row}>
        <Box className={classes.innerRow}>
          <Typography className={classes.dateLabel}>
            {hidePointsLabel
              ? `${shortenDate(entry.startTimestamp)} - ${shortenDate(entry.endTimestamp)}`
              : `${formatDate(entry.startTimestamp)} - ${formatDate(entry.endTimestamp)}`}
          </Typography>
          <Typography className={classes.pointsLabel}>
            + {formatNumberWithSpaces(entry.points.toString())} Points
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ className: classes.paper }} fullWidth>
      <img
        src={closeSmallIcon}
        className={classes.lockPositionClose}
        onClick={handleClose}
        aria-label='Close'
      />
      <Box className={classes.lockPositionHeader}>
        <Typography component='h1'>Content Points Allocations</Typography>
      </Box>
      <Box className={classes.description}>
        <Typography>
          Content Points are allocated to users who create content about Invariant on social media.
          <br />
          <br />
          Here, you can track your allocation history for the{' '}
          <a
            href='https://docs.invariant.app/docs/invariant_points/content'
            target='_blank'
            rel='noopener noreferrer'
            className={classes.link}>
            Content Program
          </a>
          .
        </Typography>
      </Box>

      <DialogContent sx={{ padding: 0 }}>
        <Box className={classes.contentSection}>
          <Typography className={classes.allocationText}>Your allocations</Typography>
          <Box className={classes.buttonRow}>
            <Box className={classes.innerRow}>
              <Typography className={classes.dateLabel}>
                {hidePointsLabel
                  ? `${shortenDate(contentProgramDates.start)} - ${shortenDate(contentProgramDates.end)}`
                  : `${contentProgramDates.start} - ${contentProgramDates.end}`}
              </Typography>
              <Button
                component='a'
                href='https://docs.invariant.app/docs/invariant_points/content'
                target='_blank'
                rel='noopener noreferrer'
                className={classes.button}>
                Submit {!hidePointsLabel && 'here'}
              </Button>
            </Box>
          </Box>
          {allocations.length >= 4 ? (
            <FixedSizeList
              height={itemSize * 3 + 2}
              width='100%'
              itemSize={itemSize}
              itemCount={allocations.length}
              className={classes.allocationSection}>
              {Row}
            </FixedSizeList>
          ) : (
            <Box className={classes.allocationSection}>
              {allocations.map((entry, index) => (
                <Box height={56} key={index} className={classes.staticRow}>
                  <Box className={classes.innerRow}>
                    <Typography className={classes.dateLabel}>
                      {hidePointsLabel
                        ? `${shortenDate(entry.startTimestamp)} - ${shortenDate(entry.endTimestamp)}`
                        : `${formatDate(entry.startTimestamp)} - ${formatDate(entry.endTimestamp)}`}
                    </Typography>
                    <Typography className={classes.pointsLabel}>
                      + {formatNumberWithSpaces(entry.points.toString())}{' '}
                      {!hidePointsLabel && 'Points'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ContentPointsModal
