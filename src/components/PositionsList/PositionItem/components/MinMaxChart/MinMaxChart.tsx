import React from 'react'
import { Box, Typography } from '@mui/material'
import { MaxHandle, MinHandle } from '@components/PriceRangePlot/Brush/svgHandles'
import { colors, typography } from '@static/theme'

interface MinMaxChartProps {
  min: number
  max: number
  current: number
}

const MIN_HANDLE_OFFSET = -21
const MAX_HANDLE_OFFSET = 99

export const MinMaxChart: React.FC<MinMaxChartProps> = ({ min, max, current }) => {
  const currentPosition = ((current - min) / (max - min)) * 100
  const isOutOfBounds = current < min || current > max
  const showGradients = !isOutOfBounds
  const minHandleOffset = isOutOfBounds && current < min ? MIN_HANDLE_OFFSET - 5 : MIN_HANDLE_OFFSET
  const maxHandleOffset = isOutOfBounds && current > max ? MAX_HANDLE_OFFSET + 5 : MAX_HANDLE_OFFSET

  return (
    <Box
      sx={{
        width: '100%',
        height: '55px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        flexDirection: 'column'
      }}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          borderBottom: `2px solid ${colors.invariant.light}`,
          position: 'relative'
        }}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            left: `${minHandleOffset}%`,
            top: 0,
            zIndex: 100
          }}>
          <MinHandle
            height={30}
            x={30}
            fill={colors.invariant.light}
            textColor={colors.invariant.lightHover}
          />
        </Box>

        <Box
          sx={{
            width: '50%',
            height: '25px',
            borderTop: `1px solid ${colors.invariant.green}`,
            background: showGradients
              ? 'linear-gradient(180deg, rgba(46, 224, 154, 0.7) 0%, rgba(46, 224, 154, 0) 100%)'
              : 'none',
            opacity: 0.7
          }}
        />

        <Box
          sx={{
            width: '50%',
            height: '25px',
            borderTop: `1px solid ${colors.invariant.pink}`,
            background: showGradients
              ? 'linear-gradient(180deg, rgba(239, 132, 245, 0.7) 0%, rgba(239, 132, 245, 0) 100%)'
              : 'none',
            opacity: 0.7
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: '2px',
            height: '25px',
            backgroundColor: colors.invariant.yellow,
            left: `${currentPosition}%`,
            transform: 'translateX(-50%)',
            zIndex: 50
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            left: `${maxHandleOffset}%`,
            top: 0,
            zIndex: 100
          }}>
          <MaxHandle
            height={30}
            x={30}
            fill={colors.invariant.light}
            textColor={colors.invariant.lightHover}
          />
        </Box>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px'
        }}>
        <Typography sx={{ ...typography.caption2, color: colors.invariant.light }}>
          {min.toFixed(4)}
        </Typography>
        <Typography sx={{ ...typography.caption2, color: colors.invariant.yellow }}>
          {current.toFixed(4)}
        </Typography>
        <Typography sx={{ ...typography.caption2, color: colors.invariant.light }}>
          {max.toFixed(4)}
        </Typography>
      </Box>
    </Box>
  )
}
