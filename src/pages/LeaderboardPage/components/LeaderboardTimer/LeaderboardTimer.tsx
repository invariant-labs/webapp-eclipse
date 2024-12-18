import { Box, Typography } from '@mui/material'
import useStyles from './styles'
import React from 'react'
interface ILeaderboardTimerProps {
  hours: string
  minutes: string
  seconds: string
}
export const LeaderboardTimer: React.FC<ILeaderboardTimerProps> = ({ hours, minutes, seconds }) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.pageWrapper}>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Typography className={classes.headerText}>Next chapter on Invariant starts in:</Typography>
      </Box>

      <Box className={classes.timerContainer}>
        <Box className={classes.timerWrapper}>
          <Box className={classes.timerBlock}>
            <Typography className={classes.timerNumber}>{hours} H</Typography>
          </Box>

          <Box className={classes.separator}>:</Box>

          <Box className={classes.timerBlock}>
            <Typography className={classes.timerNumber}>{minutes} M</Typography>
          </Box>

          <Box className={classes.separator}>:</Box>

          <Box className={classes.timerBlock}>
            <Typography className={classes.timerNumber}>{seconds} S</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
