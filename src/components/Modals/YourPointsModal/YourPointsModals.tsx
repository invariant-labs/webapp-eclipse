import React from 'react'
import useStyles from './style'
import { Box, Grid, Popover } from '@mui/material'
import { useCountdown } from '@pages/LeaderboardPage/components/LeaderboardTimer/useCountdown'
import { Timer } from './Timer'
import { LAUNCH_DATE } from '@pages/LeaderboardPage/config'

export interface ISelectNetworkModal {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
}
export const YourPointsModal: React.FC<ISelectNetworkModal> = ({ anchorEl, open, handleClose }) => {
  const { classes } = useStyles()
  const { hours, minutes, seconds } = useCountdown({
    targetDate: LAUNCH_DATE,
    onExpire: () => {}
  })

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{ paper: classes.paper }}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid className={classes.root}>
        <Box className={classes.counterContainer}>
          <Timer hours={hours} minutes={minutes} seconds={seconds} handleClose={handleClose} />
        </Box>
      </Grid>
    </Popover>
  )
}
export default YourPointsModal
