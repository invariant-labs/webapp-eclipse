import React from 'react'
import { Dialog, DialogContent, Box, Typography } from '@mui/material'
import useStyles from './style'
import { CurrentContentPointsEntry } from '@store/reducers/leaderboard'
import { FixedSizeList } from 'react-window'
import { formatDate, formatNumberWithSpaces } from '@utils/utils'

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

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const entry = userContentPoints![index]
    return (
      <Box
        key={index}
        style={style}
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'>
        <Typography className={classes.dateLabel}>
          {formatDate(entry.startTimestamp)}-{formatDate(entry.endTimestamp)}
        </Typography>
        <Typography className={classes.pointsLabel}>
          + {formatNumberWithSpaces(entry.points.toString())}
          {entry.points === 1 ? ' Point' : ' Points'}
        </Typography>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ className: classes.paper }} fullWidth>
      <Box className={classes.header}>
        <Typography>Content Points Allocations</Typography>
        {/* <IconButton onClick={handleClose}>
          <img src={icons.closeSmallIcon} alt='close icon' />
        </IconButton> */}
      </Box>
      <Box className={classes.description}>
        <Typography>
          View your points allocations history for the{' '}
          <a
            href='https://docs.invariant.app/docs/invariant_points/content'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: 'inherit', textDecoration: 'underline' }}>
            Content Program
          </a>{' '}
          below.
        </Typography>
      </Box>

      <DialogContent sx={{ padding: 0 }}>
        <Box>
          <Typography className={classes.allocationText}>Your allocations</Typography>
          {userContentPoints && userContentPoints.length > 0 ? (
            <FixedSizeList
              height={200}
              width='100%'
              itemSize={40}
              itemCount={userContentPoints.length}
              className={classes.allocationSection}>
              {Row}
            </FixedSizeList>
          ) : (
            <Typography>No allocations available</Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ContentPointsModal
