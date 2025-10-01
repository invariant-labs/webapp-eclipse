import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Grid, Typography } from '@mui/material'
import { CandlestickSeries, ColorType, createChart, ISeriesApi } from 'lightweight-charts'
import { SwapToken } from '@store/selectors/solanaWallet'
import { ALL_FEE_TIERS_DATA, CandleIntervals } from '@store/consts/static'
import { Candle, fetchData, formatNumberWithSuffix } from '@utils/utils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { swapListIcon, warningIcon } from '@static/icons'
import { FeeSelector } from './FeeSelector/FeeSelector'
import { ExtendedPoolStatsData } from '@store/selectors/stats'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { IntervalSelector } from './IntervalSelector/IntervalSelector'
import loader from '@static/gif/loader.gif'

interface iProps {
  tokenFrom: SwapToken | null
  tokenTo: SwapToken | null
  tokens: SwapToken[]
  isLoading: boolean
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  selectedFee: BN | null
  isDisabled: boolean
  disabledFeeTiers: string[]
  noData: boolean
  xToY: boolean
  setXToY: (a: boolean) => void
  poolsList: ExtendedPoolStatsData[]
  chartPoolData: PoolWithAddress | null
  chartInterval: CandleIntervals
  setChartInterval: (e: CandleIntervals) => void
  triggerReload: boolean
}

const Chart: React.FC<iProps> = ({
  tokenFrom,
  tokenTo,
  tokens,
  disabledFeeTiers,
  selectedFee,
  feeTiers,
  isLoading,
  selectFeeTier,
  noData,
  xToY,
  setXToY,
  poolsList,
  chartPoolData,
  chartInterval,
  setChartInterval,
  triggerReload
}) => {
  const { classes } = useStyles()

  const [chartLoading, setChartLoading] = useState(false)

  const feeTierIndex = useMemo(() => {
    if (selectedFee) {
      return ALL_FEE_TIERS_DATA.findIndex(fee => fee.tier.fee.toString() === selectedFee.toString())
    } else {
      return 0
    }
  }, [selectedFee?.toString()])

  const promotedPoolTierIndex = useMemo(() => {
    if (tokenFrom === null || tokenTo === null) return undefined
    return undefined
  }, [tokenFrom, tokenTo, tokens.length])

  const { feeTiersWithTvl } = useMemo(() => {
    if (tokenFrom === null || tokenTo === null) {
      return { feeTiersWithTvl: {} }
    }
    const feeTiersWithTvl: Record<number, number> = {}
    poolsList.forEach(pool => {
      const xMatch =
        pool.tokenX.equals(tokenFrom.assetAddress) && pool.tokenY.equals(tokenTo.assetAddress)
      const yMatch =
        pool.tokenX.equals(tokenTo.assetAddress) && pool.tokenY.equals(tokenFrom.assetAddress)

      if (xMatch || yMatch) {
        feeTiersWithTvl[pool.fee] = pool.tvl
      }
    })
    return { feeTiersWithTvl }
  }, [poolsList, tokenFrom, tokenTo])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | undefined>(undefined)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    //setup chart
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 350,
      layout: {
        background: { type: ColorType.Solid, color: '#0b1220' },
        textColor: '#e5e7eb'
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' }
      },
      rightPriceScale: {
        visible: true,
        borderColor: '#374151',
        scaleMargins: { top: 0.1, bottom: 0.1 }
      },
      timeScale: {
        visible: true,
        borderColor: '#374151',
        timeVisible: true
      }
    })

    chart.applyOptions({
      timeScale: { visible: true, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 }
    })

    const series = chart.addSeries(CandlestickSeries)
    series.applyOptions({
      priceLineVisible: true,
      priceLineColor: '#22c55e',
      priceLineWidth: 2,
      priceFormat: {
        type: 'custom',
        minMove: 0.0001,
        formatter: price => formatNumberWithSuffix(price)
      }
    })

    seriesRef.current = series
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return

      chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = undefined
    }
  }, [containerRef.current?.isConnected])

  const invertCandles = (candles: Candle[]): Candle[] => {
    return candles.map(c => {
      const invOpen = 1 / c.open
      const invClose = 1 / c.close
      const invHigh = 1 / c.low
      const invLow = 1 / c.high

      return {
        ...c,
        open: invOpen,
        close: invClose,
        high: invHigh,
        low: invLow,
        volume: c.volume
      }
    })
  }

  useEffect(() => {
    const selectedPoolAddress = chartPoolData?.address?.toString()
    if (!selectedPoolAddress || !seriesRef.current || !chartRef.current) return

    setChartLoading(true)

    fetchData(selectedPoolAddress, chartInterval)
      .then(data => {
        const sorted = data.sort((a, b) => Number(a.time) - Number(b.time))
        const deduped = sorted.filter(
          (candle, idx) => idx === 0 || Number(candle.time) > Number(sorted[idx - 1].time)
        )

        const finalData = xToY ? invertCandles(deduped) : deduped

        seriesRef.current?.setData(finalData as any)

        if (finalData.length > 0 && chartRef.current) {
          chartRef.current.timeScale().fitContent()
          chartRef.current.priceScale('right').setAutoScale(true)
        }
      })
      .catch(e => console.log(e))
      .finally(() => setChartLoading(false))
  }, [chartPoolData?.address?.toString(), chartInterval, xToY, triggerReload])
  if (!tokenFrom || !tokenTo) return null

  return (
    <Grid className={classes.wrapper}>
      <Typography className={classes.title}>Chart</Typography>

      <Box className={classes.container}>
        <Box display='flex' alignItems='center' gap={'6px'} minHeight={'27px'}>
          <Grid container className={classes.headerWrapper}>
            <Grid display='flex' flexDirection={'column'} mr={'auto'}>
              {/* {!isMedium && (
                <Typography
                  sx={{ ...typography.body2, color: colors.invariant.textGrey }}
                  mb={'12px'}>
                  Pool
                </Typography>
              )} */}
              <Grid container item className={classes.iconsAndNames}>
                <Grid container item className={classes.iconsShared}>
                  <Grid display='flex' position='relative'>
                    <img
                      className={classes.tokenIcon}
                      src={xToY ? tokenFrom.logoURI : tokenTo.logoURI}
                      alt={xToY ? tokenFrom.symbol : tokenTo.symbol}
                    />
                    {(xToY ? tokenFrom.isUnknown : tokenTo.isUnknown) && (
                      <img className={classes.warningIcon} src={warningIcon} />
                    )}
                  </Grid>

                  <TooltipHover title='Reverse tokens'>
                    <img
                      className={classes.arrowsShared}
                      src={swapListIcon}
                      alt='Arrow'
                      onClick={e => {
                        e.stopPropagation()
                        setXToY(!xToY)
                      }}
                    />
                  </TooltipHover>
                  <Grid display='flex' position='relative'>
                    <img
                      className={classes.tokenIcon}
                      src={xToY ? tokenTo.logoURI : tokenFrom.logoURI}
                      alt={xToY ? tokenTo.symbol : tokenFrom.symbol}
                    />
                    {(xToY ? tokenTo.isUnknown : tokenFrom.isUnknown) && (
                      <img className={classes.warningIcon} src={warningIcon} />
                    )}
                  </Grid>
                </Grid>

                <Box className={classes.tickersContainer}>
                  <Typography className={classes.names}>
                    {xToY ? tokenFrom.symbol : tokenTo.symbol} -{' '}
                    {xToY ? tokenTo.symbol : tokenFrom.symbol}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Grid>
              <Box
                display={'flex'}
                alignItems={'center'}
                // justifyContent={'space-between'}
                gap={2}
                flexWrap={'wrap'}>
                <Box className={classes.labelWrapper}>
                  {/* <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>
                    Fee tier
                  </Typography> */}
                  <FeeSelector
                    onSelect={selectFeeTier}
                    feeTiers={feeTiers}
                    currentFeeIndex={feeTierIndex}
                    promotedPoolTierIndex={promotedPoolTierIndex}
                    feeTiersWithTvl={feeTiersWithTvl}
                    disabledFeeTiers={disabledFeeTiers}
                    noData={noData}
                    isLoading={isLoading}
                    tokenX={tokenFrom}
                    tokenY={tokenTo}
                  />
                </Box>

                <Box className={classes.labelWrapper}>
                  {/* <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>
                    Interval
                  </Typography> */}
                  <IntervalSelector value={chartInterval} onChange={setChartInterval} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <div style={{ position: 'relative' }}>
          <div ref={containerRef} className={classes.chart} />

          {chartLoading && (
            <Grid container className={classes.cover}>
              <img src={loader} className={classes.loader} alt='Loader' />
            </Grid>
          )}
        </div>
      </Box>
    </Grid>
  )
}

export default Chart
