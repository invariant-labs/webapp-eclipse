import React from 'react'
import { useStyles } from './style'
import { Box } from '@mui/system'
import { Button } from '@common/Button/Button'
import { colors } from '@static/theme'
import { Intervals as IntervalsKeys } from '@store/consts/static'

interface IntervalsProps {
  interval: string
  setInterval: (interval: IntervalsKeys) => void
  marginRight?: number
}

const Intervals: React.FC<IntervalsProps> = ({ interval, setInterval, marginRight }) => {
  const { classes } = useStyles()

  const handleIntervalChange = (newInterval: IntervalsKeys) => {
    setInterval(newInterval)
  }

  const getButtonStyle = (buttonInterval: IntervalsKeys) => {
    const isSelected = interval === buttonInterval
    return {
      background: isSelected ? colors.invariant.light : colors.invariant.newDark,
      color: isSelected ? colors.invariant.text : colors.invariant.textGrey,
      '&:hover': {
        boxShadow: 'none',
        filter: 'brightness(1.15)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    }
  }

  return (
    <Box className={classes.container} style={{ marginRight: marginRight ?? 0 }}>
      <Button
        onClick={() => handleIntervalChange(IntervalsKeys.Daily)}
        scheme='normal'
        width={36}
        height={28}
        padding={8}
        borderRadius={8}
        style={getButtonStyle(IntervalsKeys.Daily)}>
        1D
      </Button>

      <Button
        onClick={() => handleIntervalChange(IntervalsKeys.Weekly)}
        scheme='normal'
        width={36}
        height={28}
        padding={8}
        borderRadius={8}
        style={getButtonStyle(IntervalsKeys.Weekly)}>
        1W
      </Button>
      <Button
        onClick={() => handleIntervalChange(IntervalsKeys.Monthly)}
        scheme='normal'
        width={36}
        height={28}
        padding={8}
        borderRadius={8}
        style={getButtonStyle(IntervalsKeys.Monthly)}>
        1M
      </Button>

      <Button
        onClick={() => handleIntervalChange(IntervalsKeys.Yearly)}
        scheme='normal'
        width={36}
        height={28}
        padding={8}
        borderRadius={8}
        style={getButtonStyle(IntervalsKeys.Yearly)}>
        1Y
      </Button>
    </Box>
  )
}

export default Intervals
