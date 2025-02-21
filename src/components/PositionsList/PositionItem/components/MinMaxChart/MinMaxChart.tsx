import React from 'react'
import { Box, Typography } from '@mui/material'
import { MaxHandleNarrower, MinHandleNarrower } from '@components/PriceRangePlot/Brush/svgHandles'
import { colors, typography } from '@static/theme'
import { formatNumberWithSuffix } from '@utils/utils'
import { useMinMaxChartStyles } from './style'
import { CHART_CONSTANTS } from './consts'

interface MinMaxChartProps {
  min: number
  max: number
  current: number
}

interface GradientBoxProps {
  color: string
  width: string
  isOutOfBound: boolean
  gradientDirection: 'left' | 'right'
}

const GradientBox: React.FC<GradientBoxProps> = ({ color, width, isOutOfBound }) => (
  <Box
    sx={{
      width,
      height: '25px',
      borderTop: `1px solid ${color}`,
      background: `linear-gradient(180deg, ${color}B3 0%, ${color}00 100%)`,
      opacity: isOutOfBound ? 0.3 : 0.7
    }}
  />
)

const CurrentValueIndicator: React.FC<{
  position: number
  value: number
}> = ({ position, value }) => {
  const { classes } = useMinMaxChartStyles()
  return (
    <Typography
      className={classes.currentValueIndicator}
      sx={{
        left: `${position}%`
      }}>
      {formatNumberWithSuffix(value)}
    </Typography>
  )
}

const PriceIndicatorLine: React.FC<{ position: number }> = ({ position }) => {
  const { classes } = useMinMaxChartStyles()

  return (
    <Box
      className={classes.priceLineIndicator}
      sx={{
        left: `${position}%`
      }}
    />
  )
}

const MinMaxLabels: React.FC<{ min: number; max: number; isOutOfBounds: boolean }> = ({
  min,
  max,
  isOutOfBounds
}) => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '6px'
    }}>
    <Typography
      sx={{
        ...typography.caption2,
        color: isOutOfBounds ? colors.invariant.light : colors.invariant.lightGrey
      }}>
      {formatNumberWithSuffix(min)}
    </Typography>
    <Typography
      sx={{
        ...typography.caption2,
        color: isOutOfBounds ? colors.invariant.light : colors.invariant.lightGrey
      }}>
      {formatNumberWithSuffix(max)}
    </Typography>
  </Box>
)

export const MinMaxChart: React.FC<MinMaxChartProps> = ({ min, max, current }) => {
  const calculateBoundedPosition = () => {
    if (current < min) return -CHART_CONSTANTS.OVERFLOW_LIMIT_LEFT
    if (current > max) return 100 + CHART_CONSTANTS.OVERFLOW_LIMIT_RIGHT / 2
    return ((current - min) / (max - min)) * 100
  }
  const { classes } = useMinMaxChartStyles()
  const isOutOfBounds = current < min || current > max

  const currentPosition = calculateBoundedPosition()

  return (
    <Box className={classes.container}>
      <CurrentValueIndicator position={currentPosition} value={current} />

      <Box className={classes.chart}>
        <Box className={classes.handleLeft}>
          <MinHandleNarrower />
        </Box>

        <GradientBox
          isOutOfBound={isOutOfBounds}
          color={colors.invariant.green}
          width={`${currentPosition}%`}
          gradientDirection='right'
        />
        <GradientBox
          color={colors.invariant.pink}
          isOutOfBound={isOutOfBounds}
          width={`${100 - currentPosition}%`}
          gradientDirection='left'
        />
        <PriceIndicatorLine position={currentPosition} />

        <Box className={classes.handleRight}>
          <MaxHandleNarrower />
        </Box>
      </Box>

      <MinMaxLabels min={min} max={max} isOutOfBounds={isOutOfBounds} />
    </Box>
  )
}
