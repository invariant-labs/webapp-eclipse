import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ResponsiveLine } from '@nivo/line'
import { Box, Typography, TextField, Grid, useMediaQuery, Skeleton } from '@mui/material'
import { colors, theme } from '@static/theme'
import { useStyles } from './style'
import { linearGradientDef } from '@nivo/core'
import BITZ from '@static/png/bitz.png'
import sBITZ from '@static/png/sBitz.png'
import { formatNumberWithoutSuffix, formatNumberWithSuffix } from '@utils/utils'

type PointData = {
  x: string
  y: number
}

interface StakeChartProps {
  stakedAmount: number
  earnedAmount: number
  earnedUsd: number
  bitzData: PointData[]
  sBitzData: PointData[]
  onStakedAmountChange?: (amount: number) => void
  stakeLoading: boolean
}

const generateMockBitzData = (): PointData[] => {
  const data: PointData[] = []
  let cumulative = 0
  const baseDaily = 0.91

  for (let i = 1; i <= 31; i++) {
    const daily = baseDaily * (1 + (i - 1) * 0.002) + Math.random() * 0.05 - 0.025
    cumulative += daily

    data.push({
      x: `Day ${i}`,
      y: Number(cumulative.toFixed(6))
    })
  }

  return data
}

const generateMockSBitzData = (): PointData[] => {
  const data: PointData[] = []
  let cumulative = 0
  const baseDaily = 0.909

  for (let i = 1; i <= 31; i++) {
    const daily = baseDaily + Math.random() * 0.02 - 0.01
    cumulative += daily

    data.push({
      x: `Day ${i}`,
      y: Number(cumulative.toFixed(6))
    })
  }

  return data
}

export const StakeChart: React.FC<StakeChartProps> = ({
  stakedAmount,
  earnedAmount,
  bitzData,
  sBitzData,
  earnedUsd,
  onStakedAmountChange,
  stakeLoading
}) => {
  const { classes } = useStyles()
  const [inputValue, setInputValue] = useState(stakedAmount.toString())

  const isLoading = !sBitzData.length || !bitzData.length || stakeLoading

  const mockData = useMemo(
    () => ({
      bitzData: generateMockBitzData(),
      sBitzData: generateMockSBitzData()
    }),
    []
  )

  const displayBitzData = isLoading ? mockData.bitzData : bitzData
  const displaySBitzData = isLoading ? mockData.sBitzData : sBitzData

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value) // Update input immediately for UI responsiveness

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const numValue = parseFloat(value) || 0
        if (onStakedAmountChange) {
          onStakedAmountChange(numValue)
        }
      }, 500)
    }
  }

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const getTickFrequency = useCallback(() => {
    if (isMobile) return 8
    if (isTablet) return 4
    return 2
  }, [isMobile, isTablet])

  useEffect(() => {
    setInputValue(stakedAmount.toString())
  }, [stakedAmount])

  const data = [
    {
      id: 'BITZ',
      color: colors.invariant.green,
      data: displayBitzData
    },
    {
      id: 'sBITZ',
      color: colors.invariant.lightBlue,
      data: displaySBitzData
    }
  ]

  const CustomValueLayer = ({ xScale, yScale }) => {
    if (!bitzData.length || !sBitzData.length) return null

    const lastBitzPoint = bitzData[bitzData.length - 1]
    const lastSBitzPoint = sBitzData[sBitzData.length - 1]

    const pointValues = [
      {
        y: lastBitzPoint.y,
        yPosition: yScale(lastBitzPoint.y),
        color: colors.invariant.green
      },
      {
        y: lastSBitzPoint.y,
        yPosition: yScale(lastSBitzPoint.y),
        color: colors.invariant.lightBlue
      }
    ]

    const xPosition = isMobile ? xScale.range()[1] - 5 : xScale(lastBitzPoint.x)

    const textAnchor = isMobile ? 'end' : 'middle'

    return (
      <g>
        {pointValues.map((point, index) => (
          <text
            key={index}
            x={xPosition + (isMobile ? 5 : 0)}
            y={point.yPosition - (index === 0 || !isMobile ? 10 : 0)}
            textAnchor={textAnchor}
            dominantBaseline='middle'
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              fill: point.color,
              filter: isMobile ? 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' : 'none'
            }}>
            {formatNumberWithSuffix(point.y.toFixed(2))}
          </text>
        ))}
      </g>
    )
  }

  return (
    <Box className={classes.chartContainer}>
      <Box className={classes.stakeText}>
        <Box className={classes.inputWrapper}>
          <Typography>Depositing</Typography>

          <TextField
            value={inputValue}
            onChange={handleInputChange}
            variant='outlined'
            type='number'
            size='small'
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*.?[0-9]*',
              min: 0,
              max: 10000,
              onKeyDown: e => {
                if (e.ctrlKey || e.metaKey) {
                  return
                }

                const allowedKeys = [
                  'Backspace',
                  'Delete',
                  'Tab',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown'
                ]
                if (allowedKeys.includes(e.key)) {
                  return
                }

                if (/[0-9]/.test(e.key)) {
                  return
                }

                if (e.key === '.' && !inputValue.includes('.')) {
                  return
                }

                e.preventDefault()
              },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value) && value > 10000) {
                  e.target.value = '10000'
                } else if (!isNaN(value) && value <= 0) {
                  e.target.value = '1'
                }
              }
            }}
            InputProps={{
              className: classes.inputProps,
              startAdornment: (
                <Box
                  component='span'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '4px',
                    paddingRight: '8px',
                    marginRight: '4px'
                  }}>
                  <img src={BITZ} alt='BITZ' style={{ height: '16px', minWidth: '16px' }} />
                </Box>
              )
            }}
            className={classes.inputField}
          />

          <Typography>
            into Liquid Staking
            <img src={sBITZ} alt='sBITZ' style={{ height: '20px', minWidth: '20px' }} />
            over the next month
          </Typography>
        </Box>

        <Box className={classes.lowerTitleWrapper}>
          <Typography>
            will earn you an extra
            {isLoading ? (
              <Skeleton
                variant='rounded'
                sx={{
                  width: isMobile ? 150 : 200,
                  marginTop: isMobile ? -0.5 : 0,
                  height: isMobile ? 15 : 20,
                  marginInline: 1
                }}
              />
            ) : (
              <Typography
                sx={{
                  color: `${colors.invariant.green} !important`,
                  mx: 0.75
                }}>
                {formatNumberWithoutSuffix(earnedAmount)} BITZ{' '}
                {earnedUsd !== 0 ? `($${formatNumberWithoutSuffix(earnedUsd)})` : ''}
              </Typography>
            )}
            compared to staking BITZ directly
          </Typography>
        </Box>
      </Box>

      <Box
        className={classes.chartBox}
        sx={{
          position: 'relative',
          filter: isLoading ? 'blur(2px)' : 'none',
          transition: 'filter 0.3s ease-in-out'
        }}>
        <ResponsiveLine
          data={data}
          margin={{
            top: 20,
            right: isMobile ? 0 : 20,
            bottom: 50,
            left: isMobile ? 40 : 60
          }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0,
            max: 'auto',
            stacked: false
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            legend: '',

            legendOffset: 36,
            tickValues: bitzData.filter((_, i) => i % getTickFrequency() === 0).map(d => d.x)
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendOffset: -40,
            tickValues: 6,
            format: value => formatNumberWithSuffix(value, { noDecimals: true })
          }}
          colors={({ color }) => color}
          pointSize={0}
          useMesh={true}
          enableSlices='x'
          enableArea={true}
          isInteractive
          areaBlendMode='normal'
          areaBaselineValue={0}
          gridXValues={[]}
          enableGridX={false}
          enableGridY={true}
          enableCrosshair
          lineWidth={1}
          gridYValues={6}
          areaOpacity={0.4}
          legends={[]}
          layers={[
            'grid',
            'markers',
            'axes',
            'areas',
            'lines',
            'points',
            'slices',
            'mesh',
            'legends',
            'crosshair',
            CustomValueLayer
          ]}
          defs={[
            linearGradientDef('gradientPink', [
              { offset: 0, color: colors.invariant.lightBlue },
              { offset: 100, color: colors.invariant.lightBlue, opacity: 0 }
            ]),
            linearGradientDef('gradientGreen', [
              { offset: 0, color: colors.invariant.green },
              { offset: 100, color: colors.invariant.green, opacity: 0 }
            ])
          ]}
          fill={[
            { match: { id: 'BITZ' }, id: 'gradientGreen' },
            { match: { id: 'sBITZ' }, id: 'gradientPink' }
          ]}
          theme={{
            axis: {
              ticks: {
                line: { stroke: colors.invariant.component },
                text: { fill: '#A9B6BF', fontSize: 13 }
              },
              legend: {
                text: {
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  fill: colors.invariant.textGrey
                }
              }
            },
            crosshair: {
              line: {
                stroke: colors.invariant.lightGrey,
                strokeWidth: 1,
                strokeDasharray: 'solid'
              }
            },
            grid: { line: { stroke: colors.invariant.light } }
          }}
          sliceTooltip={({ slice }) => {
            return (
              <Grid className={classes.tooltip}>
                {slice.points.length > 0 && (
                  <>
                    <Typography className={classes.tooltipDate}>
                      {slice.points[0].data.xFormatted}
                    </Typography>
                    {slice.points.map(point => (
                      <Box
                        key={point.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                        <img
                          src={point.serieId === 'BITZ' ? BITZ : sBITZ}
                          alt={point.serieId.toString() ?? 'Token'}
                          style={{ height: '16px', width: '16px' }}
                        />
                        <Typography
                          className={classes.tooltipValue}
                          sx={{ color: `${point.serieColor}` }}>
                          {point.serieId === 'BITZ' ? 'Rewards' : 'Earns'}:{' '}
                          {formatNumberWithSuffix(point.data.yFormatted)} BITZ
                        </Typography>
                      </Box>
                    ))}
                  </>
                )}
              </Grid>
            )
          }}
        />
      </Box>

      <Box
        className={classes.valuesContainer}
        sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 4,
          padding: '16px'
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={BITZ} alt='BITZ Logo' style={{ width: '20px', height: '20px' }} />
          {isLoading ? (
            <Skeleton variant='rounded' height={24} width={200} sx={{ marginInline: 1 }} />
          ) : (
            <Typography className={classes.bitzValue}>
              Staking Rewards: {formatNumberWithSuffix(bitzData[bitzData.length - 1].y.toFixed(2))}{' '}
              BITZ
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={sBITZ} alt='sBITZ Logo' style={{ width: '20px', height: '20px' }} />
          {isLoading ? (
            <Skeleton variant='rounded' width={200} height={24} sx={{ marginInline: 1 }} />
          ) : (
            <Typography className={classes.sBitzValue}>
              Holding Rewards:{' '}
              {formatNumberWithSuffix(sBitzData[sBitzData.length - 1].y.toFixed(2))} BITZ
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
