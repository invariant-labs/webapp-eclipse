import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography, Tooltip } from '@mui/material'
import { colors, typography } from '@static/theme'

import { TokenPositionEntry } from '@store/types/userOverview'
import { formatNumber2 } from '@utils/utils'
import { useStyles } from './styles'
import { isLoadingPositionsList } from '@store/selectors/positions'
import { useSelector } from 'react-redux'
import MobileOverviewSkeleton from './skeletons/MobileOverviewSkeleton'
interface ChartSegment {
  start: number
  width: number
  color: string
  token: string
  value: number
  logo: string | undefined
  percentage: string
}

interface MobileOverviewProps {
  positions: TokenPositionEntry[]
  totalAssets: number
  chartColors: string[]
}

const MobileOverview: React.FC<MobileOverviewProps> = ({ positions, totalAssets, chartColors }) => {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const { classes } = useStyles()
  const isLoadingList = useSelector(isLoadingPositionsList)
  const segments: ChartSegment[] = useMemo(() => {
    let currentPosition = 0
    return positions.map((position, index) => {
      const percentage = (position.value / totalAssets) * 100
      const segment = {
        start: currentPosition,
        width: percentage,
        color: chartColors[index],
        token: position.token,
        value: position.value,
        logo: position.logo,
        percentage: percentage.toFixed(2)
      }
      currentPosition += percentage
      return segment
    })
  }, [positions, totalAssets, chartColors])

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {isLoadingList ? (
        <MobileOverviewSkeleton />
      ) : (
        <>
          <Box
            sx={{
              height: '24px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              mb: 3
            }}>
            {segments.map((segment, index) => (
              <Tooltip
                key={index}
                open={selectedSegment === index}
                onClose={() => setSelectedSegment(null)}
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography sx={{ color: segment.color, mb: 0.5 }}>{segment.token}</Typography>
                    <Typography sx={{ color: colors.invariant.textGrey, mb: 0.5 }}>
                      ${formatNumber2(segment.value)}
                    </Typography>
                    <Typography sx={{ color: colors.invariant.textGrey }}>
                      {' '}
                      {segment.percentage}%
                    </Typography>
                  </Box>
                }
                placement='top'
                classes={{
                  tooltip: classes.tooltip
                }}>
                <Box
                  onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: selectedSegment === index ? 'scaleX(1.1)' : 'scaleY(1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      boxShadow: ` 40px 24px 76px 40px ${segment.color}`,
                      opacity: selectedSegment === index ? 1 : 0.4
                    }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          {segments.length > 0 ? (
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
                        ${formatNumber2(segment.value)}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  )
}

export default MobileOverview
