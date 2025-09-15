import { Box, Typography } from '@mui/material'
import useStyles from './styles'
import React from 'react'

interface ITimerProps {
  hours: string
  minutes: string
  seconds: string
  isSmall?: boolean
}
export const Timer: React.FC<ITimerProps> = ({ hours, minutes, seconds, isSmall }) => {
  const { classes } = useStyles({ isSmall: isSmall || false })

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.timerContainer}>
        <Box className={classes.timerWrapper}>
          <Box className={classes.innerContent}>
            <Box className={classes.timerBlock}>
              <Typography className={isSmall ? classes.smallText : classes.timerNumber}>
                {hours} H
              </Typography>
            </Box>

            <Box className={isSmall ? classes.smallText : classes.separator}>:</Box>

            <Box className={classes.timerBlock}>
              <Typography className={isSmall ? classes.smallText : classes.timerNumber}>
                {minutes} M
              </Typography>
            </Box>

            <Box className={isSmall ? classes.smallText : classes.separator}>:</Box>

            <Box className={classes.timerBlock}>
              <Typography className={isSmall ? classes.smallText : classes.timerNumber}>
                {seconds} S
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
