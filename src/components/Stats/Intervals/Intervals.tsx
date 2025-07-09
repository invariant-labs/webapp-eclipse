import React from 'react'
import useStyles from './style'
import { Box } from '@mui/system'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'

interface IntervalsProps {
  interval: string
  intervals: string[]
  setInterval: (interval: IntervalsKeys) => void
  dark?: boolean
  fullWidth?: boolean
}

const Intervals: React.FC<IntervalsProps> = ({
  interval,
  intervals,
  setInterval,
  dark,
  fullWidth
}) => {
  const { classes } = useStyles({ interval, intervals, dark, fullWidth })

  const handleIntervalChange = (_: any, newInterval: string) => {
    if (!newInterval) return
    if (newInterval === '1Y') {
      setInterval(IntervalsKeys.Yearly)
    } else if (newInterval === '1M') {
      setInterval(IntervalsKeys.Monthly)
    } else if (newInterval === '1W') {
      setInterval(IntervalsKeys.Weekly)
    } else {
      setInterval(IntervalsKeys.Daily)
    }
  }

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.switchWrapper}>
        <Box className={classes.container}>
          <Box className={classes.switchPoolsContainer}>
            <Box className={classes.switchPoolsMarker} />
            <ToggleButtonGroup
              value={interval}
              exclusive
              onChange={handleIntervalChange}
              className={classes.switchPoolsButtonsGroup}>
              {intervals.map(interval => (
                <ToggleButton
                  value={interval}
                  disableRipple
                  className={classes.switchPoolsButton}
                  style={{ fontWeight: interval === interval ? 700 : 400 }}
                  key={interval}>
                  {interval}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Intervals
