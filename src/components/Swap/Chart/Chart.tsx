import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { CandlestickSeries, ColorType, createChart, ISeriesApi } from 'lightweight-charts'
import { SwapToken } from '@store/selectors/solanaWallet'
import { ALL_FEE_TIERS_DATA, CandleIntervals } from '@store/consts/static'
import { fetchData, formatNumberWithSuffix } from '@utils/utils'
import { colors, typography } from '@static/theme'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { swapListIcon, warningIcon } from '@static/icons'
import { FeeSelector } from './FeeSelector/FeeSelector'
import { ExtendedPoolStatsData } from '@store/selectors/stats'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { IntervalSelector } from './IntervalSelector/IntervalSelector'

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
}

const Chart: React.FC<iProps> = ({
  tokenFrom,
  tokenTo,
  tokens,
  disabledFeeTiers,
  selectedFee,
  feeTiers,
  // isDisabled,
  isLoading,
  selectFeeTier,
  noData,
  xToY,
  setXToY,
  poolsList,
  chartPoolData,
  chartInterval,
  setChartInterval
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

    // const tokenX = tokens[tokenFromIndex]
    // const tokenY = tokens[tokenToIndex]
    // const tierIndex =
    //   tokenX === null || tokenY === null
    //     ? undefined
    //     : promotedTiers.find(
    //         tier =>
    //           (tier.tokenX.equals(tokenX.assetAddress) &&
    //             tier.tokenY.equals(tokenY.assetAddress)) ||
    //           (tier.tokenX.equals(tokenY.assetAddress) && tier.tokenY.equals(tokenX.assetAddress))
    //       )?.index ?? undefined

    // return tierIndex
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

  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>()

  useEffect(() => {
    const selectedPoolAddress = chartPoolData?.address.toString()
    if (!containerRef.current || !selectedPoolAddress) return

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
        scaleMargins: {
          top: 0.1,
          bottom: 0.1
        }
      },

      timeScale: {
        visible: true,
        borderColor: '#374151',
        timeVisible: true
      }
    })

    chart.applyOptions({
      timeScale: {
        visible: true, // ensures horizontal axis is shown
        borderColor: '#374151',
        timeVisible: true, // show HH:mm if intraday
        secondsVisible: false // hide seconds unless you need them
      },
      crosshair: {
        mode: 1 // CrosshairMode.Normal
      }
    })

    seriesRef.current = chart.addSeries(CandlestickSeries)

    seriesRef.current?.applyOptions({
      priceLineVisible: true,
      priceLineColor: '#22c55e',
      priceLineWidth: 2,
      priceFormat: {
        type: 'custom',
        minMove: 0.0001, // smallest tick
        formatter: price => formatNumberWithSuffix(price) // custom formatter
      }
      // upColor: '#22c55e',
      // borderUpColor: '#22c55e',
      // wickUpColor: '#22c55e',
      // downColor: '#ef4444',
      // borderDownColor: '#ef4444',
      // wickDownColor: '#ef4444'
    })

    fetchData(selectedPoolAddress, chartInterval)
      .then(data => {
        setChartLoading(true)
        const sorted = data.sort((a, b) => a.time - b.time)
        const deduped = sorted.filter(
          (candle, idx) => idx === 0 || candle.time > sorted[idx - 1].time
        )

        seriesRef.current?.setData(deduped)

        if (deduped.length > 0) {
          // 👇 Automatically fit the entire range of data
          chart.timeScale()

          chart.priceScale('right').setAutoScale(true)
        }
      })
      .catch(e => console.log(e))
      .finally(() => setChartLoading(false))

    return () => {
      chart.remove()
    }
  }, [tokenFrom, tokenTo, tokens, chartPoolData, chartInterval])

  if (!tokenFrom || !tokenTo) return

  return (
    <Grid className={classes.wrapper}>
      <Typography className={classes.title}>Chart</Typography>

      <Box className={classes.container}>
        <Box display='flex' alignItems='center' gap={'6px'} minHeight={'27px'}>
          <Grid container mb={'24px'}>
            <Grid display='flex' flexDirection={'column'} mr={'24px'}>
              <Typography
                sx={{ ...typography.body2, color: colors.invariant.textGrey }}
                mb={'12px'}>
                Pool
              </Typography>
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
            <Grid ml={'auto'}>
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} gap={2}>
                <Box>
                  <Typography
                    sx={{ ...typography.body2, color: colors.invariant.textGrey }}
                    mb={'12px'}>
                    Fee tier
                  </Typography>
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

                <Box>
                  <Typography
                    sx={{ ...typography.body2, color: colors.invariant.textGrey }}
                    mb={'12px'}>
                    Interval
                  </Typography>
                  <IntervalSelector value={chartInterval} onChange={setChartInterval} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {chartLoading ? (
          <Skeleton
            width={'100%'}
            height={350}
            variant='rectangular'
            className={classes.skeleton}
          />
        ) : (
          <div ref={containerRef} className={classes.chart} />
        )}
      </Box>
    </Grid>
  )
}

export default Chart
