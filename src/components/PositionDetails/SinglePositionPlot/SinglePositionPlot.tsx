import PriceRangePlot, { TickPlotPositionData } from '@common/PriceRangePlot/PriceRangePlot'
import { Box, Grid, Typography } from '@mui/material'
import {
  calcPriceByTickIndex,
  calcTicksAmountInRange,
  calculateConcentration,
  formatNumberWithoutSuffix,
  formatNumberWithSuffix,
  numberToString,
  spacingMultiplicityGte,
  truncateString
} from '@utils/utils'
import { PlotTickData } from '@store/reducers/positions'
import React, { useEffect, useMemo, useState } from 'react'
import useStyles from './style'
import { getMaxTick, getMinTick } from '@invariant-labs/sdk-eclipse/lib/utils'
import { Stat } from './Stat/Stat'
import { boostPointsBoldIcon } from '@static/icons'
import { RangeIndicator } from './RangeIndicator/RangeIndicator'
import { ILiquidityToken } from '@store/consts/types'
import { colors } from '@static/theme'

export interface ISinglePositionPlot {
  data: PlotTickData[]
  leftRange: TickPlotPositionData
  rightRange: TickPlotPositionData
  midPrice: TickPlotPositionData
  currentPrice: number
  tokenY: Pick<ILiquidityToken, 'name' | 'decimal'>
  tokenX: Pick<ILiquidityToken, 'name' | 'decimal'>
  ticksLoading: boolean
  tickSpacing: number
  min: number
  max: number
  xToY: boolean
  hasTicksError?: boolean
  reloadHandler: () => void
  isFullRange: boolean
  usdcPrice: {
    token: string
    price?: number
  } | null
  positionId: string
}

const SinglePositionPlot: React.FC<ISinglePositionPlot> = ({
  data,
  leftRange,
  rightRange,
  midPrice,
  currentPrice,
  tokenY,
  tokenX,
  ticksLoading,
  tickSpacing,
  min,
  max,
  xToY,
  hasTicksError,
  reloadHandler,
  isFullRange,
  usdcPrice,
  positionId
}) => {
  const { classes } = useStyles()

  const [plotMin, setPlotMin] = useState(0)
  const [plotMax, setPlotMax] = useState(1)

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentXtoY, setCurrentXtoY] = useState(xToY)

  const middle = (Math.abs(leftRange.x) + Math.abs(rightRange.x)) / 2

  const calcZoomScale = (newMaxPlot: number) => {
    const proportionLength = newMaxPlot - middle
    const scaleMultiplier = ((rightRange.x - middle) * 100) / proportionLength

    return scaleMultiplier
  }

  //Proportion between middle of price range and right range in ratio to middle of price range and plotMax
  const [zoomScale, setZoomScale] = useState(0.7)

  useEffect(() => {
    if (!isInitialLoad) setIsInitialLoad(true)
  }, [positionId])

  useEffect(() => {
    const initSideDist = Math.abs(
      leftRange.x -
        calcPriceByTickIndex(
          Math.max(
            spacingMultiplicityGte(getMinTick(tickSpacing), tickSpacing),
            leftRange.index - tickSpacing * 15
          ),
          xToY,
          tokenX.decimal,
          tokenY.decimal
        )
    )

    if (currentXtoY !== xToY) {
      const plotMax = ((rightRange.x - middle) * 100) / zoomScale + middle
      const plotMin = -(((middle - leftRange.x) * 100) / zoomScale - middle)

      setPlotMax(plotMax)
      setPlotMin(plotMin)

      setCurrentXtoY(xToY)
    }

    if (isInitialLoad) {
      const rangeDiff = Math.abs(rightRange.x - leftRange.x)

      setIsInitialLoad(false)
      setPlotMin(leftRange.x - rangeDiff / 5)
      setPlotMax(rightRange.x + rangeDiff / 5)

      setZoomScale(calcZoomScale(rightRange.x + initSideDist))
    }
  }, [ticksLoading, leftRange, rightRange, isInitialLoad])

  const zoomMinus = () => {
    const diff = plotMax - plotMin
    const newMin = plotMin - diff / 4
    const newMax = plotMax + diff / 4

    const zoomMultiplier = calcZoomScale(newMax)
    setZoomScale(zoomMultiplier)

    setPlotMin(newMin)
    setPlotMax(newMax)
  }

  const zoomPlus = () => {
    const diff = plotMax - plotMin
    const newMin = plotMin + diff / 6
    const newMax = plotMax - diff / 6

    const zoomMultiplier = calcZoomScale(newMax)
    setZoomScale(zoomMultiplier)

    if (
      calcTicksAmountInRange(
        Math.max(newMin, 0),
        newMax,
        Number(tickSpacing),
        xToY,
        Number(tokenX.decimal),
        Number(tokenY.decimal)
      ) >= 4
    ) {
      setPlotMin(newMin)
      setPlotMax(newMax)
    }
  }

  const moveLeft = () => {
    const diff = plotMax - plotMin

    const minPrice = xToY
      ? calcPriceByTickIndex(
          getMinTick(tickSpacing),
          xToY,
          Number(tokenX.decimal),
          Number(tokenY.decimal)
        )
      : calcPriceByTickIndex(
          getMaxTick(tickSpacing),
          xToY,
          Number(tokenX.decimal),
          Number(tokenY.decimal)
        )

    const newLeft = plotMin - diff / 6
    const newRight = plotMax - diff / 6

    if (newLeft < minPrice - diff / 2) {
      setPlotMin(minPrice - diff / 2)
      setPlotMax(minPrice + diff / 2)
    } else {
      setPlotMin(newLeft)
      setPlotMax(newRight)
    }
  }

  const moveRight = () => {
    const diff = plotMax - plotMin

    const maxPrice = xToY
      ? calcPriceByTickIndex(
          getMaxTick(tickSpacing),
          xToY,
          Number(tokenX.decimal),
          Number(tokenY.decimal)
        )
      : calcPriceByTickIndex(
          getMinTick(tickSpacing),
          xToY,
          Number(tokenX.decimal),
          Number(tokenY.decimal)
        )

    const newLeft = plotMin + diff / 6
    const newRight = plotMax + diff / 6

    if (newRight > maxPrice + diff / 2) {
      setPlotMin(maxPrice - diff / 2)
      setPlotMax(maxPrice + diff / 2)
    } else {
      setPlotMin(newLeft)
      setPlotMax(newRight)
    }
  }

  const centerChart = () => {
    const diff = plotMax - plotMin

    setPlotMin(midPrice.x - diff / 2)
    setPlotMax(midPrice.x + diff / 2)
  }

  const centerToRange = () => {
    const diff = plotMax - plotMin
    const rangeCenter = (leftRange.x + rightRange.x) / 2

    setPlotMin(rangeCenter - diff / 2)
    setPlotMax(rangeCenter + diff / 2)
  }

  const minPercentage = ((+min - currentPrice) / currentPrice) * 100
  const maxPercentage = ((+max - currentPrice) / currentPrice) * 100
  const concentration = calculateConcentration(leftRange.index, rightRange.index)

  const { formattedMin, formattedMax } = useMemo(() => {
    let formattedMin = formatNumberWithSuffix(min)
    let formattedMax = formatNumberWithSuffix(max)

    const maxIterations = 4
    let currentIterations = 0
    while (formattedMin === formattedMax && currentIterations < maxIterations) {
      formattedMin = formatNumberWithSuffix(min, {
        decimalsAfterDot: currentIterations + 4,
        noSubNumbers: true,
        alternativeConfig: true
      })
      formattedMax = formatNumberWithSuffix(max, {
        decimalsAfterDot: currentIterations + 4,
        noSubNumbers: true,
        alternativeConfig: true
      })

      currentIterations += 1
    }

    return {
      formattedMin,
      formattedMax
    }
  }, [min, max, xToY])

  return (
    <Box className={classes.container}>
      <Box className={classes.headerContainer}>
        <Grid display='flex' flexDirection='column' justifyContent='flex-start'>
          <Typography className={classes.header}>Price range</Typography>

          <Typography className={classes.currentPrice} mt={1.5}>
            {formatNumberWithoutSuffix(midPrice.x)} {tokenX.name} per {tokenY.name}
          </Typography>
          {usdcPrice !== null && usdcPrice.price ? (
            <Typography className={classes.usdcCurrentPrice}>
              {usdcPrice.token} ${formatNumberWithoutSuffix(usdcPrice.price)}
            </Typography>
          ) : (
            <Box minHeight={20} />
          )}
        </Grid>
        <Grid display='flex' flexDirection={'column'} gap={1}>
          <RangeIndicator
            isLoading={ticksLoading}
            inRange={min <= currentPrice && currentPrice <= max}
          />
          <Grid container justifyContent='flex-end' alignItems='center'>
            <Typography className={classes.currentPrice}>Current price</Typography>
            <Typography className={classes.currentPrice} ml={0.5} mt={'3px'}>
              ━━━
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <PriceRangePlot
        plotData={data}
        plotMinData={plotMin}
        plotMaxData={plotMax}
        zoomMinus={zoomMinus}
        zoomPlus={zoomPlus}
        moveLeft={moveLeft}
        moveRight={moveRight}
        centerChart={centerChart}
        centerToRange={centerToRange}
        disabled
        leftRangeData={leftRange}
        rightRangeData={rightRange}
        midPriceData={midPrice}
        className={classes.plot}
        loading={ticksLoading}
        isXtoY={xToY}
        spacing={tickSpacing}
        xDecimal={tokenX.decimal}
        yDecimal={tokenY.decimal}
        hasError={hasTicksError}
        reloadHandler={reloadHandler}
      />
      <Box className={classes.statsWrapper}>
        <Box className={classes.statsContainer}>
          <Stat
            name='CURRENT PRICE'
            isLoading={ticksLoading}
            value={
              <Box>
                <Typography component='span' className={classes.value}>
                  {numberToString(currentPrice.toFixed(xToY ? tokenY.decimal : tokenX.decimal))}
                </Typography>{' '}
                {xToY ? truncateString(tokenY.name, 4) : truncateString(tokenX.name, 4)} {' / '}
                {xToY ? truncateString(tokenX.name, 4) : truncateString(tokenY.name, 4)}
              </Box>
            }
          />
          <Stat
            name={
              <Box className={classes.concentrationContainer}>
                <img className={classes.concentrationIcon} src={boostPointsBoldIcon} />
                CONCENTRATION
              </Box>
            }
            value={
              <Typography className={classes.concentrationValue}>
                {concentration.toFixed(2)}x
              </Typography>
            }
          />
        </Box>
        <Box className={classes.statsContainer}>
          {isFullRange ? (
            <Stat
              value={
                <Box>
                  <Typography component='span' className={classes.value}>
                    FULL RANGE
                  </Typography>
                </Box>
              }
              isHorizontal
            />
          ) : (
            <>
              <Stat
                name='MIN'
                value={
                  <Box>
                    <Typography component='span' className={classes.value}>
                      {isFullRange ? 0 : formattedMin}
                    </Typography>{' '}
                    {!isFullRange &&
                      (xToY
                        ? truncateString(tokenY.name, 4)
                        : truncateString(tokenX.name, 4) + ' / ' + xToY
                          ? truncateString(tokenX.name, 4)
                          : truncateString(tokenY.name, 4))}
                  </Box>
                }
                isHorizontal
              />
              <Stat
                name='MAX'
                value={
                  <Box>
                    <Typography component='span' className={classes.value}>
                      {isFullRange ? <span style={{ fontSize: '24px' }}>∞</span> : formattedMax}
                    </Typography>{' '}
                    {!isFullRange &&
                      (xToY
                        ? truncateString(tokenY.name, 4)
                        : truncateString(tokenX.name, 4) + ' / ' + xToY
                          ? truncateString(tokenX.name, 4)
                          : truncateString(tokenY.name, 4))}
                  </Box>
                }
                isHorizontal
              />
            </>
          )}
        </Box>
        <Box className={classes.statsContainer}>
          <Stat
            isLoading={ticksLoading}
            name='% MIN'
            value={
              <Box>
                <Typography
                  component='span'
                  className={classes.value}
                  style={{
                    color: minPercentage < 0 ? colors.invariant.Error : colors.invariant.green
                  }}>
                  {minPercentage > 0 && '+'}
                  {formatNumberWithSuffix(minPercentage.toString(), {
                    decimalsAfterDot: 2,
                    noSubNumbers: true,
                    alternativeConfig: true
                  })}
                  %
                </Typography>
              </Box>
            }
            isHorizontal
          />
          <Stat
            isLoading={ticksLoading}
            name='% MAX'
            value={
              <Box>
                <Typography
                  component='span'
                  className={classes.value}
                  style={{
                    color: maxPercentage < 0 ? colors.invariant.Error : colors.invariant.green
                  }}>
                  {maxPercentage > 0 && '+'}
                  {formatNumberWithSuffix(maxPercentage.toString(), {
                    decimalsAfterDot: 2,
                    noSubNumbers: true,
                    alternativeConfig: true
                  })}
                  %
                </Typography>
              </Box>
            }
            isHorizontal
          />
        </Box>
      </Box>
    </Box>
  )
}

export default SinglePositionPlot
