import React from 'react'
import { ResponsiveLine } from '@nivo/line'
import { linearGradientDef } from '@nivo/core'
import { colors, theme, typography } from '@static/theme'
import { useStyles } from './style'
import { TimeData } from '@store/reducers/stats'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { formatNumberWithoutSuffix, trimZeros } from '@utils/utils'
import {
  formatLargeNumber,
  formatPlotDataLabels,
  getLabelDate,
  // getLabelDate,
  mapIntervalToPrecision
} from '@utils/uiUtils'
import { Intervals as IntervalsKeys } from '@store/consts/static'
interface LiquidityInterface {
  // liquidityVolume: number | null
  data: TimeData[]
  className?: string
  isLoading: boolean
  interval: IntervalsKeys
  //   lastStatsTimestamp: number
  color: string
}

const SupplyChart: React.FC<LiquidityInterface> = ({
  data,
  className,
  color,
  isLoading,
  interval
  // lastStatsTimestamp
}) => {
  const { classes, cx } = useStyles()

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'))

  const isTablet = isMdUp && isLgDown

  return (
    <Grid className={cx(classes.container, className)}>
      <Grid className={classes.barContainer}>
        <ResponsiveLine
          key={`${interval}-${isLoading}`}
          animate={false}
          sliceTooltip={() => <></>}
          enableCrosshair
          enablePointLabel={false}
          debugSlices={false}
          enableSlices={false}
          debugMesh={false}
          areaBaselineValue={0}
          pointBorderWidth={0}
          areaBlendMode='normal'
          pointLabel=''
          pointBorderColor=''
          pointColor=''
          areaOpacity={0.4}
          pointSize={2}
          yScale={{
            min: 0,
            max: 'auto',
            type: 'linear'
          }}
          layers={[
            'grid',
            'markers',
            'areas',
            'lines',
            'points',
            'slices',
            'mesh',
            'legends',
            'axes',
            'crosshair'
          ]}
          data={[
            {
              id: 'liquidity',
              data: data.map(({ timestamp, value }) => ({
                x: new Date(timestamp),
                y: value
              }))
            }
          ]}
          margin={
            isMobile
              ? { top: 24, bottom: 24, left: 30, right: 18 }
              : { top: 24, bottom: 24, left: 30, right: 24 }
          }
          xScale={{
            type: 'time',
            format: 'native',
            precision: 'day',
            useUTC: false
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: time =>
              isLoading
                ? ''
                : formatPlotDataLabels(time, data.length, interval, isMobile || isTablet),
            tickValues: isLoading ? [] : mapIntervalToPrecision(interval)
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 2,
            tickRotation: 0,
            tickValues: 5,
            renderTick: ({ x, y, value }) => (
              <g transform={`translate(${x - (isMobile ? 22 : 30)},${y + 4})`}>
                <text
                  style={{ fill: colors.invariant.textGrey, ...typography.tiny2 }}
                  textAnchor='start'
                  dominantBaseline='center'>
                  {trimZeros(formatLargeNumber(value))}
                </text>
              </g>
            )
          }}
          gridYValues={5}
          legends={[]}
          axisTop={null}
          axisRight={null}
          curve={'monotoneX'}
          role='aplication'
          enableGridX={false}
          enableGridY={true}
          enablePoints={false}
          enableArea={true}
          isInteractive
          useMesh
          colors={color}
          theme={{
            axis: {
              ticks: {
                line: { stroke: colors.invariant.component },
                text: { fill: '#A9B6BF' }
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
          lineWidth={1}
          defs={[
            linearGradientDef('gradient', [
              { offset: 0, color: 'inherit' },
              { offset: 50, color: 'inherit' },
              { offset: 100, color: 'inherit', opacity: 0.2 }
            ])
          ]}
          fill={[{ match: '*', id: 'gradient' }]}
          crosshairType='bottom'
          tooltip={({ point }) => {
            const date = getLabelDate(
              interval,
              (point.data.x as Date).getTime(),
              (point.data.x as Date).getTime()
            )

            return (
              <Grid className={classes.tooltip}>
                <Typography className={classes.tooltipDate}>{date}</Typography>
                <Typography className={classes.tooltipValue} style={{ color }}>
                  {formatNumberWithoutSuffix(point.data.y as number)}
                </Typography>
              </Grid>
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

export default SupplyChart
