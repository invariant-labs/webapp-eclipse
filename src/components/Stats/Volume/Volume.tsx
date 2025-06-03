import React, { useMemo } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { colors, theme, typography } from '@static/theme'
import { linearGradientDef } from '@nivo/core'
import { useStyles } from './style'
import { TimeData } from '@store/reducers/stats'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { Box } from '@mui/system'
import { formatNumberWithSuffix, trimZeros } from '@utils/utils'
import {
  getLimitingTimestamp,
  formatLargeNumber,
  formatPlotDataLabels,
  getLabelDate
} from '@utils/uiUtils'
import useIsMobile from '@store/hooks/isMobile'
import { Intervals as IntervalsKeys } from '@store/consts/static'

interface StatsInterface {
  volume: number | null
  data: TimeData[]
  className?: string
  isLoading: boolean
  interval: IntervalsKeys
}

const Volume: React.FC<StatsInterface> = ({ volume, data, className, isLoading, interval }) => {
  const { classes, cx } = useStyles()

  volume = volume ?? 0

  const isXsDown = useMediaQuery(theme.breakpoints.down('xs'))
  const isMobile = useIsMobile()
  const latestTimestamp = useMemo(
    () =>
      Math.max(
        ...data
          .map(d => d.timestamp)
          .concat(interval !== IntervalsKeys.Daily ? getLimitingTimestamp() : 0)
      ),
    [data, interval]
  )

  const Theme = {
    axis: {
      fontSize: '14px',
      tickColor: 'transparent',
      ticks: { line: { stroke: colors.invariant.component }, text: { fill: '#A9B6BF' } },
      legend: { text: { stroke: 'transparent' } }
    },
    grid: { line: { stroke: colors.invariant.light } }
  }

  return (
    <Grid className={cx(classes.container, className)}>
      <Box className={classes.volumeContainer}>
        <Grid container justifyContent={'space-between'} alignItems='center'>
          <Typography className={classes.volumeHeader}>Volume</Typography>
        </Grid>
        <div className={classes.volumePercentContainer}>
          <Typography className={classes.volumePercentHeader}>
            ${formatNumberWithSuffix(isLoading ? Math.random() * 10000 : volume)}
          </Typography>
        </div>
      </Box>
      <div className={classes.barContainer}>
        <ResponsiveBar
          layout='vertical'
          key={`${interval}-${isLoading}`}
          animate={false}
          margin={{ top: 30, bottom: 30, left: 30, right: 4 }}
          data={data as Array<{ timestamp: number; value: number }>}
          keys={['value']}
          indexBy='timestamp'
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            format: time =>
              isLoading ? '' : formatPlotDataLabels(time, data.length, interval, isMobile)
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 2,
            tickRotation: 0,
            tickValues: 5,
            renderTick: isLoading
              ? () => <text></text>
              : ({ x, y, value }) => (
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
              { offset: 100, color: '#9C3EBD', opacity: 0.8 }
            ])
          ]}
          fill={[{ match: '*', id: 'gradient' }]}
          colors={colors.invariant.pink}
          tooltip={({ data }) => {
            const date = getLabelDate(interval, data.timestamp, latestTimestamp)

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
