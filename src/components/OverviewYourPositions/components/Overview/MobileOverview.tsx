import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'

import { TokenPositionEntry } from '@store/types/userOverview'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './styles/styles'
import { isLoadingPositionsList } from '@store/selectors/positions'
import { useSelector } from 'react-redux'
import MobileOverviewSkeleton from './skeletons/MobileOverviewSkeleton'
import SegmentFragmentTooltip from './SegmentFragmentTooltip'
export interface ChartSegment {
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
  const isLoadingList = useSelector(isLoadingPositionsList)
  const { classes } = useStyles({ isLoading: isLoadingList })

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => b.value - a.value)
  }, [positions])

  const sortedChartColors = useMemo(() => {
    const colorMap = positions.reduce((map, position, index) => {
      map.set(position.token, chartColors[index])
      return map
    }, new Map<string, string>())

    return sortedPositions.map(position => colorMap.get(position.token) ?? '')
  }, [positions, sortedPositions, chartColors])

  const segments: ChartSegment[] = useMemo(() => {
    let currentPosition = 0
    return sortedPositions.map((position, index) => {
      const percentage = (position.value / totalAssets) * 100
      const segment = {
        start: currentPosition,
        width: percentage,
        color: sortedChartColors[index],
        token: position.token,
        value: position.value,
        logo: position.logo,
        percentage: percentage.toFixed(2)
      }
      currentPosition += percentage
      return segment
    })
  }, [sortedPositions, totalAssets, sortedChartColors])

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
              <SegmentFragmentTooltip
                tooltipClasses={{ tooltip: classes.tooltip }}
                segment={segment}
                selectedSegment={selectedSegment}
                setSelectedSegment={setSelectedSegment}
                colors={colors}
                index={index}
              />
            ))}
          </Box>
          {segments.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  ...typography.body2,
                  fontWeight: 600,
                  color: colors.invariant.textGrey,
                  mb: 2
                }}>
                Tokens
              </Typography>

              <Grid
                container
                spacing={1}
                sx={{
                  marginTop: 1,
                  width: '100% !important',
                  maxHeight: '120px',
                  marginLeft: '0 !important',
                  overflowY: 'auto',
                  paddingRight: '8px',
                  marginRight: '-4px',
                  marginBottom: '5px',
                  '&::-webkit-scrollbar': {
                    width: '4px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: colors.invariant.newDark
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
                        ${formatNumberWithoutSuffix(segment.value, { twoDecimals: true })}
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
