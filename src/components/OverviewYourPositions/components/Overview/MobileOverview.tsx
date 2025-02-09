import React, { useMemo } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'

import { TokenPositionEntry } from '@store/types/userOverview'

interface ChartSegment {
  start: number
  width: number
  color: string
  token: string
  value: number
  logo: string | undefined
}

interface MobileOverviewProps {
  positions: TokenPositionEntry[]
  totalAssets: number
  chartColors: string[]
}

// For internal use in useMemo
type SegmentsCalculation = ChartSegment[]

const MobileOverview: React.FC<MobileOverviewProps> = ({ positions, totalAssets, chartColors }) => {
  const segments: SegmentsCalculation = useMemo(() => {
    let currentPosition = 0
    return positions.map((position, index) => {
      const percentage = (position.value / totalAssets) * 100
      const segment = {
        start: currentPosition,
        width: percentage,
        color: chartColors[index],
        token: position.token,
        value: position.value,
        logo: position.logo
      }
      currentPosition += percentage
      return segment
    })
  }, [positions, totalAssets, chartColors])
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Stacked Bar Chart */}
      <Box
        sx={{
          height: '24px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          mb: 3
        }}>
        {segments.map((segment, index) => (
          <Box
            key={index}
            sx={{
              width: `${segment.width}%`,
              bgcolor: segment.color,
              height: '100%',
              borderRadius:
                index === 0
                  ? '12px 0 0 12px'
                  : index === segments.length - 1
                    ? '0 12px 12px 0'
                    : '0',
              boxShadow: `inset 0px 0px 8px ${segment.color}`,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                boxShadow: `0px 2px 6px ${segment.color}`,
                opacity: 0.4
              }
            }}
          />
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 2 }}>
        <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey, mb: 2 }}>
          Tokens
        </Typography>

        <Grid
          container
          spacing={1}
          sx={{
            marginTop: 1,
            width: '100% !important',
            minHeight: '120px',
            marginLeft: '0 !important',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.invariant.pink,
              borderRadius: '4px'
            }
          }}>
          {segments.map(segment => (
            <Grid
              item
              container
              key={segment.token}
              sx={{
                paddingLeft: '0 !important',
                marginLet: '0 !important',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}>
              <Grid
                item
                xs={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                <img
                  src={segment.logo}
                  alt={'Token logo'}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '100%'
                  }}
                />
              </Grid>

              <Grid item xs={1}>
                <Typography
                  sx={{
                    ...typography.heading4,
                    color: segment.color
                  }}>
                  {segment.token}:
                </Typography>
              </Grid>

              <Grid item xs={10}>
                <Typography
                  sx={{
                    ...typography.heading4,
                    color: colors.invariant.text,
                    textAlign: 'right',
                    paddingLeft: '8px'
                  }}>
                  ${segment.value.toFixed(9)}
                </Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default MobileOverview
