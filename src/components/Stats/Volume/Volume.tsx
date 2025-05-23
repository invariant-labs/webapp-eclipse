import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { colors, theme, typography } from '@static/theme'
import { linearGradientDef } from '@nivo/core'
import { useStyles } from './style'
import { TimeData } from '@store/reducers/stats'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { Box } from '@mui/system'
import { formatNumberWithSuffix, trimZeros } from '@utils/utils'
import { formatLargeNumber, formatPlotDataLabels, getLabelDate } from '@utils/uiUtils'
import useIsMobile from '@store/hooks/isMobile'
import Intervals from '../Intervals/Intervals'
import { Intervals as IntervalsKeys } from '@store/consts/static'

interface StatsInterface {
  percentVolume: number | null
  volume: number | null
  data: TimeData[]
  className?: string
  isLoading: boolean
  interval: IntervalsKeys
  setInterval: (interval: IntervalsKeys) => void
}

const Volume: React.FC<StatsInterface> = ({
  percentVolume,
  volume,
  data,
  className,
  isLoading,
  interval,
  setInterval
}) => {
  const { classes, cx } = useStyles()

  percentVolume = percentVolume ?? 0
  volume = volume ?? 0

  const isXsDown = useMediaQuery(theme.breakpoints.down('xs'))
  const isMobile = useIsMobile()

  const Theme = {
    axis: {
      fontSize: '14px',
      tickColor: 'transparent',
      ticks: { line: { stroke: colors.invariant.component }, text: { fill: '#A9B6BF' } },
      legend: { text: { stroke: 'transparent' } }
    },
    grid: { line: { stroke: colors.invariant.light } }
  }

  const isLower = percentVolume < 0
  const percentage = isLoading ? Math.random() * 200 - 100 : percentVolume

  return (
    <Grid
      className={cx(classes.container, className, {
        [classes.loadingOverlay]: isLoading
      })}>
      <Box className={classes.volumeContainer}>
        <Grid container justifyContent={'space-between'} alignItems='center'>
          <Typography className={classes.volumeHeader}>Volume</Typography>
          <Intervals interval={interval} setInterval={setInterval} />
        </Grid>
        <div className={classes.volumePercentContainer}>
          <Typography className={classes.volumePercentHeader}>
            ${formatNumberWithSuffix(isLoading ? Math.random() * 10000 : volume)}
          </Typography>
          <Box className={classes.volumeStatusContainer}>
            <Box
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
            </Box>
          </Box>
        </div>
      </Box>
      <div className={classes.barContainer}>
        <ResponsiveBar
          layout='vertical'
          key={`${interval}-${isLoading}`}
          animate={!isLoading}
          margin={{ top: 30, bottom: 30, left: 30 }}
          data={data as Array<{ timestamp: number; value: number }>}
          keys={['value']}
          indexBy='timestamp'
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: time => formatPlotDataLabels(time, data.length, interval, isMobile)
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 2,
            tickRotation: 0,
            tickValues: 5,
            renderTick: ({ x, y, value }) => (
              <g transform={`translate(${x - (isMobile ? 22 : 30)},${y + 4})`}>
                {' '}
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
          theme={Theme}
          groupMode='grouped'
          enableLabel={false}
          enableGridY={true}
          innerPadding={isXsDown ? 1 : 2}
          isInteractive
          padding={0.03}
          indexScale={{ type: 'band', round: true }}
          defs={[
            linearGradientDef('gradient', [
              { offset: 0, color: '#EF84F5' },
              { offset: 100, color: '#9C3EBD', opacity: 0.7 }
            ])
          ]}
          fill={[{ match: '*', id: 'gradient' }]}
          colors={colors.invariant.pink}
          tooltip={({ data }) => {
            const date = getLabelDate(interval, data.timestamp)

            return (
              <Grid className={classes.tooltip}>
                <Typography className={classes.tooltipDate}>{date}</Typography>
                <Typography className={classes.tooltipValue}>
                  ${formatNumberWithSuffix(data.value)}
                </Typography>
              </Grid>
            )
          }}
        />
      </div>
    </Grid>
  )
}

export default Volume
