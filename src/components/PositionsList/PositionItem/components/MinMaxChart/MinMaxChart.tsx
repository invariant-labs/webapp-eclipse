import React from 'react'
import { Box, Typography } from '@mui/material'
import { MaxHandleNarrower, MinHandleNarrower } from '@components/PriceRangePlot/Brush/svgHandles'
import { colors, typography } from '@static/theme'
import { formatNumber2 } from '@utils/utils'

const CONSTANTS = {
  MAX_HANDLE_OFFSET: 99,
  OVERFLOW_LIMIT: 3,
  CHART_PADDING: 21
} as const

interface MinMaxChartProps {
  min: number
  max: number
  current: number
}

interface GradientBoxProps {
  color: string
  width: string
  gradientDirection: 'left' | 'right'
}

const GradientBox: React.FC<GradientBoxProps> = ({ color, width }) => (
  <Box
    sx={{
      width,
      height: '25px',
      borderTop: `1px solid ${color}`,
      background: `linear-gradient(180deg, ${color}B3 0%, ${color}00 100%)`,
      opacity: 0.7
    }}
  />
)

const CurrentValueIndicator: React.FC<{
  position: number
  value: number
  isOutOfBounds: boolean
}> = ({ position, value, isOutOfBounds }) => (
  <Typography
    sx={{
      ...typography.caption2,
      color: isOutOfBounds ? colors.invariant.textGrey : colors.invariant.yellow,
      position: 'absolute',
      left: `${position}%`,
      transform: 'translateX(-50%)',
      top: '-16px',
      whiteSpace: 'nowrap',
      zIndex: 101
    }}>
    {formatNumber2(value)}
  </Typography>
)

const PriceIndicatorLine: React.FC<{ position: number; isOutOfBounds: boolean }> = ({
  position,
  isOutOfBounds
}) => (
  <Box
    sx={{
      position: 'absolute',
      width: '2px',
      height: '25px',
      backgroundColor: isOutOfBounds ? colors.invariant.textGrey : colors.invariant.yellow,
      top: '0%',
      left: `${position}%`,
      transform: 'translateX(-50%)',
      zIndex: 50
    }}
  />
)

const MinMaxLabels: React.FC<{ min: number; max: number }> = ({ min, max }) => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '6px'
    }}>
    <Typography sx={{ ...typography.caption2, color: colors.invariant.lightGrey }}>
      {formatNumber2(min)}
    </Typography>
    <Typography sx={{ ...typography.caption2, color: colors.invariant.lightGrey }}>
      {formatNumber2(max)}
    </Typography>
  </Box>
)

export const MinMaxChart: React.FC<MinMaxChartProps> = ({ min, max, current }) => {
  const calculateBoundedPosition = () => {
    if (current < min) return -CONSTANTS.OVERFLOW_LIMIT
    if (current > max) return 100 + CONSTANTS.OVERFLOW_LIMIT / 2
    return ((current - min) / (max - min)) * 100
  }

  const currentPosition = calculateBoundedPosition()
  const isOutOfBounds = current < min || current > max

  return (
    <Box
      sx={{
        width: '100%',
        height: '55px',
        display: 'flex',
        marginTop: '10px',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        flexDirection: 'column'
      }}>
      <CurrentValueIndicator
        position={currentPosition}
        value={current}
        isOutOfBounds={isOutOfBounds}
      />

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          borderBottom: `2px solid ${colors.invariant.light}`,
          position: 'relative',
          overflow: 'visible'
        }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 100,
            transform: `translateX(-${CONSTANTS.CHART_PADDING}px)`
          }}>
          <MinHandleNarrower />
        </Box>

        <GradientBox
          color={colors.invariant.green}
          width={`${currentPosition}%`}
          gradientDirection='right'
        />
        <GradientBox
          color={colors.invariant.pink}
          width={`${100 - currentPosition}%`}
          gradientDirection='left'
        />
        <PriceIndicatorLine position={currentPosition} isOutOfBounds={isOutOfBounds} />

        <Box
          sx={{
            position: 'absolute',
            left: `${CONSTANTS.MAX_HANDLE_OFFSET}%`,
            top: 0,
            zIndex: 100
          }}>
          <MaxHandleNarrower />
        </Box>
      </Box>

      <MinMaxLabels min={min} max={max} />
    </Box>
  )
}
