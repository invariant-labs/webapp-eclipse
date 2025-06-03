import { Grid, Typography, useMediaQuery } from '@mui/material'
import { linearGradientDef } from '@nivo/core'
import { Layer, ResponsiveLine } from '@nivo/line'
import ZoomInIcon from '@static/svg/zoom-in-icon.svg'
import ZoomOutIcon from '@static/svg/zoom-out-icon.svg'
import { colors, theme } from '@static/theme'
import { formatNumberWithSuffix, nearestTickIndex } from '@utils/utils'
import { PlotTickData } from '@store/reducers/positions'
import React, { useCallback, useMemo, useRef } from 'react'
import Brush from './Brush/Brush'
import useStyles from './style'
import { BN } from '@coral-xyz/anchor'
import { Button } from '@common/Button/Button'
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import ArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter'
import { centerToRangeIcon } from '@static/icons'
import loader from '@static/gif/loader.gif'
import { chartPlaceholder } from '@store/consts/static'

export type TickPlotPositionData = Omit<PlotTickData, 'y'>

export type InitMidPrice = TickPlotPositionData & { sqrtPrice: BN }

export interface IPriceRangePlot {
  plotData: PlotTickData[]
  midPriceData?: TickPlotPositionData
  leftRangeData: TickPlotPositionData
  rightRangeData: TickPlotPositionData
  onChangeRange?: (left: number, right: number) => void
  style?: React.CSSProperties
  className?: string
  disabled?: boolean
  plotMinData: number
  plotMaxData: number
  zoomMinus: () => void
  zoomPlus: () => void
  moveLeft: () => void
  moveRight: () => void
  centerChart: () => void
  centerToRange?: () => void
  loading?: boolean
  isXtoY: boolean
  xDecimal: number
  yDecimal: number
  spacing: number
  hasError?: boolean
  reloadHandler: () => void
}

export const PriceRangePlot: React.FC<IPriceRangePlot> = ({
  plotData,
  leftRangeData,
  rightRangeData,
  midPriceData,
  onChangeRange,
  style,
  className,
  disabled = false,
  plotMinData,
  plotMaxData,
  zoomMinus,
  zoomPlus,
  moveLeft,
  moveRight,
  centerChart,
  centerToRange,
  loading,
  isXtoY,
  xDecimal,
  yDecimal,
  spacing,
  hasError = false,
  reloadHandler
}) => {
  const data = loading ? chartPlaceholder.tickmaps : plotData
  const leftRange = loading ? chartPlaceholder.leftRange : leftRangeData
  const rightRange = loading ? chartPlaceholder.rightRange : rightRangeData
  const plotMin = loading ? chartPlaceholder.plotMin : plotMinData
  const plotMax = loading ? chartPlaceholder.plotMax : plotMaxData
  const midPrice = loading ? chartPlaceholder.midPrice : midPriceData
  const tickSpacing = loading ? chartPlaceholder.tickSpacing : spacing

  const { classes, cx } = useStyles()

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const containerRef = useRef<HTMLDivElement>(null)

  const maxVal = useMemo(() => Math.max(...data.map(element => element?.y)), [data])

  const pointsOmitter = useCallback(
    (data: Array<{ x: number; y: number }>) => {
      if (containerRef.current === null || data.length <= 1000) {
        return data
      }

      const minXDist = containerRef.current.offsetWidth / 100000
      const minYChange = containerRef.current.offsetHeight / 1000

      const dataAfterOmit: Array<{ x: number; y: number }> = []

      data.forEach((tick, index) => {
        if (
          index === 0 ||
          index === data.length - 1 ||
          (dataAfterOmit.length > 0 &&
            ((tick?.x - dataAfterOmit[dataAfterOmit.length - 1]?.x) / (plotMax - plotMin) >=
              minXDist ||
              Math.abs(tick?.y - dataAfterOmit[dataAfterOmit.length - 1]?.y) / maxVal >=
                minYChange))
        ) {
          dataAfterOmit.push(tick)
        }
      })

      return dataAfterOmit
    },
    [containerRef.current, plotMin, plotMax, maxVal]
  )

  const currentLessThanRange = useMemo(() => {
    let rangeData: Array<{ x: number; y: number }> = data.filter(tick => tick?.x <= leftRange?.x)
    const outData: Array<{ x: number; y: number }> = data.filter(
      tick => tick?.x < Math.max(plotMin, data[0]?.x)
    )

    if (!rangeData.length) {
      return []
    }

    if (rangeData[rangeData.length - 1]?.x < leftRange?.x) {
      rangeData.push({
        x: leftRange?.x,
        y: rangeData[rangeData.length - 1]?.y
      })
    }

    rangeData = rangeData.slice(outData.length, rangeData.length)

    if (rangeData[0]?.x > Math.max(plotMin, data[0]?.x)) {
      rangeData.unshift({
        x: Math.max(plotMin, data[0]?.x),
        y: outData.length > 0 ? outData[outData.length - 1]?.y : 0
      })
    }

    return pointsOmitter(rangeData)
  }, [disabled, leftRange, data, plotMin, plotMax, pointsOmitter])

  const currentRange = useMemo(() => {
    if (leftRange?.x > plotMax || rightRange?.x < plotMin) {
      return []
    }

    const lessThan = data.filter(tick => tick?.x <= leftRange?.x).length
    let rangeData: Array<{ x: number; y: number }> = data.filter(
      tick => tick?.x >= leftRange?.x && tick?.x <= rightRange?.x
    )

    if (!rangeData.length) {
      rangeData.push({
        x: Math.max(leftRange?.x, plotMin),
        y: data[lessThan - 1]?.y
      })

      rangeData.push({
        x: Math.min(rightRange?.x, plotMax),
        y: data[lessThan - 1]?.y
      })
    } else {
      if (rangeData[0]?.x > leftRange?.x) {
        rangeData.unshift({
          x: leftRange?.x,
          y: rangeData[0]?.y
        })
      }

      if (rangeData[rangeData.length - 1]?.x < rightRange?.x) {
        rangeData.push({
          x: rightRange?.x,
          y: rangeData[rangeData.length - 1]?.y
        })
      }

      const outMinData: Array<{ x: number; y: number }> = rangeData.filter(
        tick => tick?.x < Math.max(plotMin, data[0]?.x)
      )
      const outMaxData: Array<{ x: number; y: number }> = rangeData.filter(
        tick => tick?.x > Math.min(plotMax, data[data.length - 1]?.x)
      )
      const newRangeData: Array<{ x: number; y: number }> = rangeData.slice(
        outMinData.length,
        rangeData.length - outMaxData.length
      )

      if (!newRangeData.length || newRangeData[0]?.x > Math.max(plotMin, rangeData[0]?.x)) {
        newRangeData.unshift({
          x: Math.max(plotMin, rangeData[0]?.x),
          y: outMinData.length > 0 ? outMinData[outMinData.length - 1]?.y : 0
        })
      }

      if (
        newRangeData[newRangeData.length - 1]?.x <
        Math.min(plotMax, rangeData[rangeData.length - 1]?.x)
      ) {
        newRangeData.push({
          x: Math.min(plotMax, rangeData[rangeData.length - 1]?.x),
          y: newRangeData[newRangeData.length - 1]?.y
        })
      }

      rangeData = newRangeData
    }

    return pointsOmitter(rangeData)
  }, [disabled, data, leftRange, rightRange, plotMin, plotMax, pointsOmitter])

  const currentGreaterThanRange = useMemo(() => {
    let rangeData: Array<{ x: number; y: number }> = data.filter(tick => tick?.x >= rightRange?.x)
    const outData: Array<{ x: number; y: number }> = data.filter(
      tick => tick?.x > Math.min(plotMax, data[data.length - 1]?.x)
    )

    if (!rangeData.length) {
      return []
    }

    if (rangeData[0]?.x > rightRange?.x) {
      rangeData.unshift({
        x: rightRange?.x,
        y: rangeData[0]?.y
      })
    }

    rangeData = rangeData.slice(0, rangeData.length - outData.length)

    if (rangeData[rangeData.length - 1]?.x < Math.min(plotMax, data[data.length - 1]?.x)) {
      rangeData.push({
        x: Math.min(plotMax, data[data.length - 1]?.x),
        y: rangeData[rangeData.length - 1]?.y
      })
    }

    return pointsOmitter(rangeData)
  }, [disabled, data, rightRange, plotMin, plotMax, pointsOmitter])

  const currentLayer: Layer = ({ innerWidth, innerHeight }) => {
    if (typeof midPrice === 'undefined') {
      return null
    }

    const unitLen = innerWidth / (plotMax - plotMin)
    return (
      <svg x={(midPrice?.x - plotMin) * unitLen - 20} y={-20} width={40} height={innerHeight + 20}>
        <defs>
          <filter id='shadow-global-price' x='-10' y='-9' width='20' height={innerHeight}>
            <feGaussianBlur in='SourceGraphic' stdDeviation='8' />
          </filter>
        </defs>
        <rect
          x={14}
          y={20}
          width='16'
          height={innerHeight}
          filter='url(#shadow-global-price)'
          opacity='0.3'
        />
        <rect x={19} y={20} width='3' height={innerHeight} fill={colors.invariant.yellow} />
      </svg>
    )
  }

  const bottomLineLayer: Layer = ({ innerWidth, innerHeight }) => {
    const bottomLine = innerHeight
    return <rect x={0} y={bottomLine} width={innerWidth} height={1} fill={colors.invariant.light} />
  }

  const brushLayer = Brush(
    leftRange?.x,
    rightRange?.x,
    position => {
      const nearest = nearestTickIndex(
        plotMin + position * (plotMax - plotMin),
        tickSpacing,
        isXtoY,
        xDecimal,
        yDecimal
      )
      onChangeRange?.(
        isXtoY
          ? Math.min(rightRange.index - tickSpacing, nearest)
          : Math.max(rightRange.index + tickSpacing, nearest),
        rightRange.index
      )
    },
    position => {
      const nearest = nearestTickIndex(
        plotMin + position * (plotMax - plotMin),
        tickSpacing,
        isXtoY,
        xDecimal,
        yDecimal
      )
      onChangeRange?.(
        leftRange.index,
        isXtoY
          ? Math.max(leftRange.index + tickSpacing, nearest)
          : Math.min(leftRange.index - tickSpacing, nearest)
      )
    },
    plotMin,
    plotMax,
    disabled
  )

  const highlightLayer = ({ innerWidth, innerHeight }) => {
    const unitLen = innerWidth / (plotMax - plotMin)

    return (
      <svg width='100%' height='100%' pointerEvents='none'>
        <defs>
          <linearGradient id='gradient1' x1='0%' y1='20%' x2='0%' y2='100%'>
            <stop offset='0%' style={{ stopColor: `rgba(46, 224, 154, 0)` }} />
            <stop offset='100%' style={{ stopColor: 'rgba(46, 224, 154, 0.4)' }} />
          </linearGradient>
        </defs>
        <rect
          x={(leftRange?.x - plotMin) * unitLen}
          y={0}
          width={(rightRange?.x - leftRange?.x) * unitLen}
          height={innerHeight}
          fill='url(#gradient1)'
        />
      </svg>
    )
  }

  const isNoPositions = data.every(tick => !(tick?.y > 0))

  const isMd = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Grid container className={cx(classes.container, className)} style={style} ref={containerRef}>
      {loading ? (
        <Grid container className={classes.cover}>
          <img src={loader} className={classes.loader} alt='Loader' />
        </Grid>
      ) : null}
      {!loading && hasError ? (
        <Grid container className={classes.cover}>
          <Grid className={classes.errorWrapper} container>
            <Typography className={classes.errorText}>Unable to load liquidity chart</Typography>
            <Button scheme='pink' onClick={reloadHandler}>
              Reload chart
            </Button>
          </Grid>
        </Grid>
      ) : null}

      <>
        <Grid className={classes.zoomButtonsWrapper}>
          <Button
            scheme='green'
            width={isMd ? 28 : 36}
            height={isMd ? 28 : 36}
            borderRadius={10}
            padding={0}
            onClick={zoomPlus}>
            <img src={ZoomInIcon} className={classes.zoomIcon} alt='Zoom in' />
          </Button>
          <Button
            scheme='green'
            width={isMd ? 28 : 36}
            height={isMd ? 28 : 36}
            borderRadius={10}
            padding={0}
            onClick={zoomMinus}>
            <img src={ZoomOutIcon} className={classes.zoomIcon} alt='Zoom out' />
          </Button>
          <Button
            scheme='pink'
            width={isMd ? 28 : 36}
            height={isMd ? 28 : 36}
            borderRadius={10}
            padding={0}
            onClick={centerChart}>
            <VerticalAlignCenterIcon
              sx={{
                width: isMd ? 28 : 32,
                height: isMd ? 28 : 32,
                transform: 'rotate(90deg)'
              }}
            />
          </Button>
          {centerToRange && (
            <Button
              scheme='pink'
              width={isMd ? 28 : 36}
              height={isMd ? 28 : 36}
              borderRadius={10}
              padding={0}
              onClick={centerToRange}>
              <img
                src={centerToRangeIcon}
                alt='Center to range'
                width={isMd ? 24 : 30}
                height={isMd ? 24 : 30}
              />
            </Button>
          )}
        </Grid>

        <Grid className={classes.leftArrow}>
          <Button
            scheme='pink'
            width={isMd ? 28 : 36}
            height={isMd ? 28 : 36}
            borderRadius={10}
            padding={0}
            onClick={moveLeft}>
            <ArrowLeftIcon
              sx={{
                width: isMd ? 28 : 32,
                height: isMd ? 28 : 32
              }}
            />
          </Button>
        </Grid>
        <Grid className={classes.rightArrow}>
          <Button
            scheme='pink'
            width={isMd ? 28 : 36}
            height={isMd ? 28 : 36}
            borderRadius={10}
            padding={0}
            onClick={moveRight}>
            <ArrowRightIcon
              sx={{
                width: isMd ? 28 : 32,
                height: isMd ? 28 : 32
              }}
            />
          </Button>
        </Grid>

        <ResponsiveLine
          sliceTooltip={() => <></>}
          tooltip={() => <></>}
          useMesh={false}
          enableCrosshair={false}
          enablePointLabel={false}
          debugSlices={false}
          enableSlices={false}
          debugMesh={false}
          areaBaselineValue={0}
          pointBorderWidth={0}
          areaBlendMode='normal'
          crosshairType='x'
          pointLabel=''
          pointBorderColor=''
          pointColor=''
          lineWidth={2}
          pointSize={2}
          areaOpacity={0.2}
          data={[
            {
              id: 'less than range',
              data: currentLessThanRange.length > 0 ? currentLessThanRange : [{ x: plotMin, y: 0 }]
            },
            {
              id: 'range',
              data: currentRange.length > 0 ? currentRange : [{ x: plotMin, y: plotMax }]
            },
            {
              id: 'greater than range',
              data:
                currentGreaterThanRange.length > 0
                  ? currentGreaterThanRange
                  : [{ x: plotMax, y: 0 }]
            }
          ]}
          curve={isXtoY ? 'stepAfter' : 'stepBefore'}
          margin={{ top: isSmDown ? 55 : 25, bottom: 15 }}
          colors={[
            colors.invariant.chartDisabled,
            colors.invariant.green,
            colors.invariant.chartDisabled
          ]}
          axisTop={null}
          axisRight={null}
          axisLeft={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 0,
            tickRotation: 0,
            tickValues: 5,
            format: value => (value < 0 ? '' : formatNumberWithSuffix(value.toString()))
          }}
          xScale={{
            type: 'linear',
            min: plotMin,
            max: plotMax
          }}
          yScale={{
            type: 'linear',
            min: 0,
            max: isNoPositions ? 1 : maxVal
          }}
          enableGridX={false}
          enableGridY={false}
          enablePoints={false}
          enableArea={true}
          legends={[]}
          isInteractive={false}
          animate={false}
          role='application'
          layers={[
            bottomLineLayer,
            'grid',
            'markers',
            'areas',
            'lines',
            currentLayer,
            brushLayer,
            'axes',
            'legends',
            highlightLayer
          ]}
          defs={[
            linearGradientDef('gradient', [
              { offset: 0, color: 'inherit' },
              { offset: 50, color: 'inherit' },
              { offset: 100, color: 'inherit', opacity: 0 }
            ])
          ]}
          fill={[
            {
              match: '*',
              id: 'gradient'
            }
          ]}
        />
      </>
    </Grid>
  )
}
export default PriceRangePlot
