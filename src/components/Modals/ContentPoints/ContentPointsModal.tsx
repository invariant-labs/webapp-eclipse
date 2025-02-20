import React from 'react'
import { Dialog, DialogContent, Box, Typography, Button } from '@mui/material'
import { FixedSizeList } from 'react-window'
import useStyles from './style'
import { formatDate, formatNumberWithSpaces } from '@utils/utils'

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

export const ContentPointsModal: React.FC<IContentPointsModal> = ({
  open,
  handleClose,
  userContentPoints
}) => {
  const { classes } = useStyles()

  const allocations = userContentPoints ?? []

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (index === allocations.length) {
      return (
        <Box key={index} style={style} className={classes.row}>
          <Box className={classes.innerRow}>
            <Typography className={classes.dateLabel}>15.02.2025 - 28.02.2025</Typography>
            <Button
              component='a'
              href='https://docs.google.com/forms/d/e/1FAIpQLSe9fziOpaFeSj8fCEZWnKm5DHON2gqGeEM771s8tldihfBZUw/viewform'
              target='_blank'
              rel='noopener noreferrer'
              className={classes.button}>
              Sumbit here
            </Button>
          </Box>
        </Box>
      )
    }
    const entry = allocations[index]

    return (
      <Box key={index} style={style} className={classes.row}>
        <Box className={classes.innerRow}>
          <Typography className={classes.dateLabel}>
            {`${formatDate(entry.startTimestamp)} - ${formatDate(entry.endTimestamp)}`}
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
      <Box className={classes.lockPositionHeader}>
        <Typography component='h1'>Content Points Allocations</Typography>
        <Button className={classes.lockPositionClose} onClick={handleClose} aria-label='Close' />
      </Box>
      <Box className={classes.description}>
        <Typography>
          Content Points are allocated to users who create content about Invariant on social media.
          <br />
          <br />
          Here, you can track your allocation history for the{' '}
          <span className={classes.link}>Content Program</span>.
        </Typography>
      </Box>

      <DialogContent sx={{ padding: 0 }}>
        <Box>
          <Typography className={classes.allocationText}>Your allocations</Typography>
          <FixedSizeList
            height={allocations.length < 2 ? 120 : 200}
            width='100%'
            itemSize={56}
            itemCount={allocations.length + 1}
            className={classes.allocationSection}>
            {Row}
          </FixedSizeList>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ContentPointsModal
