import React from 'react'
import { ResponsiveLine } from '@nivo/line'
import { linearGradientDef } from '@nivo/core'
import { colors, typography } from '@static/theme'
import { useStyles } from './style'
import { TimeData } from '@store/reducers/stats'
import { Grid, Typography } from '@mui/material'
import { formatNumberWithSuffix, trimZeros } from '@utils/utils'
import {
  formatLargeNumber,
  formatPlotDataLabels,
  getLabelDate,
  mapIntervalToPrecision
} from '@utils/uiUtils'
import useIsMobile from '@store/hooks/isMobile'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import Intervals from '../Intervals/Intervals'

interface LiquidityInterface {
  liquidityPercent: number | null
  liquidityVolume: number | null
  data: TimeData[]
  className?: string
  isLoading: boolean
  interval: IntervalsKeys
  setInterval: (interval: IntervalsKeys) => void
}

const Liquidity: React.FC<LiquidityInterface> = ({
  liquidityPercent,
  liquidityVolume,
  data,
  className,
  isLoading,
  interval,
  setInterval
}) => {
  const { classes, cx } = useStyles()

  liquidityPercent = liquidityPercent ?? 0
  liquidityVolume = liquidityVolume ?? 0

  const isLower = liquidityPercent < 0
  const isMobile = useIsMobile()
  const percentage = isLoading ? Math.random() * 200 - 100 : liquidityPercent

  return (
    <Grid className={cx(classes.container, className, { [classes.loadingOverlay]: isLoading })}>
      <Grid className={classes.liquidityContainer}>
        <Grid container justifyContent={'space-between'} alignItems='center'>
          <Typography className={classes.liquidityHeader}>Liquidity</Typography>
          <Intervals interval={interval} setInterval={setInterval} marginRight={24} />
        </Grid>
        <Grid className={classes.volumePercentHeader}>
          <Typography className={classes.volumeLiquidityHeader}>
            ${formatNumberWithSuffix(isLoading ? Math.random() * 10000 : liquidityVolume)}
          </Typography>
          <Grid className={classes.volumeStatusContainer}>
            <Grid
              className={cx(
                classes.volumeStatusColor,
                isLower ? classes.backgroundVolumeLow : classes.backgroundVolumeUp
              )}>
              <Typography
                component='p'
                className={cx(
                  classes.volumeStatusHeader,
                  isLower ? classes.volumeLow : classes.volumeUp
                )}>
                {percentage < 0 ? percentage.toFixed(2) : `+${percentage.toFixed(2)}`}%
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.barContainer}>
        <ResponsiveLine
          animate
          data={[
            {
              id: 'liquidity',
              // data: data as Array<{ timestamp: number; value: number }>
              data: data.map(({ timestamp, value }) => ({
                // x: new Date(timestamp).toLocaleDateString('en-GB'),
                x: new Date(timestamp),
                y: value
              }))
            }
          ]}
          margin={
            isMobile
              ? { top: 24, bottom: 24, left: 30, right: 12 }
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
            format: time => formatPlotDataLabels(time, data.length, interval, isMobile),
            tickValues: mapIntervalToPrecision(interval)
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
          colors={colors.invariant.green}
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
              { offset: 100, color: 'inherit', opacity: 0 }
            ])
          ]}
          fill={[{ match: '*', id: 'gradient' }]}
          crosshairType='bottom'
          tooltip={({ point }) => {
            const date = getLabelDate(interval, (point.data.x as Date).getTime())

            return (
              <Grid className={classes.tooltip}>
                <Typography className={classes.tooltipDate}>{date}</Typography>
                <Typography className={classes.tooltipValue}>
                  ${formatNumberWithSuffix(point.data.y as number)}
                </Typography>
              </Grid>
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

export default Liquidity
