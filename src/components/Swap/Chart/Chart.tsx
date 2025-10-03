import React, { useEffect, useMemo, useRef, useState } from 'react'
import useStyles from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { CandlestickSeries, ColorType, createChart, ISeriesApi } from 'lightweight-charts'
import { SwapToken } from '@store/selectors/solanaWallet'
import { ALL_FEE_TIERS_DATA, CandleIntervals, disabledPools } from '@store/consts/static'
import { Candle, fetchData, formatNumberWithSuffix, initialXtoY } from '@utils/utils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { swapListIcon, warningIcon } from '@static/icons'
import { FeeSelector } from './FeeSelector/FeeSelector'
import { ExtendedPoolStatsData } from '@store/selectors/stats'
import { BN } from '@coral-xyz/anchor'
import { PoolWithAddress } from '@store/reducers/pools'
import { IntervalSelector } from './IntervalSelector/IntervalSelector'
import loader from '@static/gif/loader.gif'
import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'
import { colors, theme, typography } from '@static/theme'
import { PublicKey } from '@solana/web3.js'

interface iProps {
  tokenFromAddress: PublicKey | null
  tokenToAddress: PublicKey | null
  tokens: Record<string, SwapToken>
  allPools: PoolWithAddress[]
  isLoading: boolean
  feeTiers: number[]
  poolsList: ExtendedPoolStatsData[]
  chartInterval: CandleIntervals
  setChartInterval: (e: CandleIntervals) => void
  triggerReload: boolean
}

const Chart: React.FC<iProps> = ({
  tokenFromAddress,
  tokenToAddress,
  allPools,
  tokens,
  feeTiers,
  isLoading,
  poolsList,
  chartInterval,
  setChartInterval,
  triggerReload
}) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const [chartPoolData, setChartPoolData] = useState<PoolWithAddress | null>(null)
  const [selectedFee, setSelectedFee] = useState<BN | null>(null)
  const [isNoData, setIsNoData] = useState(false)

  const [chartLoading, setChartLoading] = useState(true)

  const { poolPairString, tokenFrom, tokenTo } = useMemo(() => {
    if (!tokenFromAddress || !tokenToAddress)
      return { poolPairString: '', tokenFrom: null, tokenTo: null }

    const isXtoYPair = tokenFromAddress.toString() < tokenToAddress.toString()

    const poolPairString = isXtoYPair
      ? tokenFromAddress.toString() + tokenToAddress.toString()
      : tokenToAddress.toString() + tokenFromAddress.toString()

    const tokenFrom = isXtoYPair
      ? tokens[tokenFromAddress.toString()]
      : tokens[tokenToAddress.toString()]

    const tokenTo = isXtoYPair
      ? tokens[tokenToAddress.toString()]
      : tokens[tokenFromAddress.toString()]

    return { poolPairString, tokenFrom, tokenTo }
  }, [tokenFromAddress, tokenToAddress, tokens])

  const [isXtoY, setIsXtoY] = useState(
    initialXtoY(tokenFrom?.assetAddress?.toString(), tokenTo?.assetAddress?.toString())
  )

  useEffect(() => {
    setIsXtoY(initialXtoY(tokenFrom?.assetAddress?.toString(), tokenTo?.assetAddress?.toString()))
  }, [chartPoolData?.address.toString()])

  useEffect(() => {
    const pairPools: PoolWithAddress[] = []
    allPools.map(pool => {
      if (
        (pool.tokenX.toString() === tokenFrom?.assetAddress.toString() &&
          pool.tokenY.toString() === tokenTo?.assetAddress.toString()) ||
        (pool.tokenX.toString() === tokenTo?.assetAddress.toString() &&
          pool.tokenY.toString() === tokenFrom?.assetAddress.toString())
      ) {
        pairPools.push(pool)
      }
    })

    if (!pairPools.length) {
      setChartPoolData(null)
      return
    }

    const poolWithHighestLiquidity = pairPools.reduce((maxPool, currentPool) => {
      return currentPool.liquidity.gt(maxPool.liquidity) ? currentPool : maxPool
    }, pairPools[0])

    setSelectedFee(poolWithHighestLiquidity.fee)

    setChartPoolData(poolWithHighestLiquidity)
  }, [allPools.length, poolPairString])

  useEffect(() => {
    const pairPools: PoolWithAddress[] = []
    allPools.map(pool => {
      if (
        (pool.tokenX.toString() === tokenFrom?.assetAddress.toString() &&
          pool.tokenY.toString() === tokenTo?.assetAddress.toString()) ||
        (pool.tokenX.toString() === tokenTo?.assetAddress.toString() &&
          pool.tokenY.toString() === tokenFrom?.assetAddress.toString())
      ) {
        pairPools.push(pool)
      }
    })

    if (!pairPools.length) {
      setChartPoolData(null)
      return
    }

    const selectedPool = pairPools.find(pool => pool.fee.toString() === selectedFee?.toString())

    if (selectedPool) {
      setChartPoolData(selectedPool)
      return
    } else {
      setChartPoolData(null)
    }
  }, [selectedFee])

  const selectFeeTier = (index: number) => {
    setSelectedFee(ALL_FEE_TIERS_DATA[index]?.tier.fee)
  }

  const feeTierIndex = useMemo(() => {
    if (selectedFee) {
      return ALL_FEE_TIERS_DATA.findIndex(fee => fee.tier.fee.toString() === selectedFee.toString())
    } else {
      return 0
    }
  }, [selectedFee?.toString()])

  const promotedPoolTierIndex = useMemo(() => {
    if (!tokenFrom || !tokenTo) return undefined
    return undefined
  }, [tokenFrom, tokenTo, tokens.length])

  const { feeTiersWithTvl } = useMemo(() => {
    if (!tokenFrom || !tokenTo) {
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

  const { disabledFeeTiers } = useMemo(() => {
    if (!tokenFrom?.assetAddress || !tokenTo?.assetAddress) {
      return { isDisabled: false, disabledFeeTiers: [] }
    }

    const matchingPools = disabledPools.filter(
      pool =>
        (pool.tokenX.equals(tokenFrom.assetAddress) && pool.tokenY.equals(tokenTo.assetAddress)) ||
        (pool.tokenX.equals(tokenTo.assetAddress) && pool.tokenY.equals(tokenFrom.assetAddress))
    )

    const disabledFeeTiers = matchingPools.flatMap(p => p.feeTiers)

    return { disabledFeeTiers }
  }, [tokenFrom, tokenTo, disabledPools])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | undefined>(undefined)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)

  useEffect(() => {
    //setup chart
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: isMd ? 300 : containerRef.current.clientHeight,
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
      priceLineColor: colors.invariant.green,
      priceLineWidth: 1,
      priceFormat: {
        type: 'custom',
        minMove: 0.000000001,
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
    if (!selectedPoolAddress || !seriesRef.current || !chartRef.current) {
      return
    }

    setChartLoading(true)

    fetchData(selectedPoolAddress, chartInterval)
      .then(data => {
        const sorted = data.sort((a, b) => Number(a.time) - Number(b.time))
        const deduped = sorted.filter(
          (candle, idx) => idx === 0 || Number(candle.time) > Number(sorted[idx - 1].time)
        )

        const finalData = isXtoY ? deduped : invertCandles(deduped)

        if (!finalData.length) {
          setIsNoData(true)
        } else {
          setIsNoData(false)
        }

        seriesRef.current?.setData(finalData as any)

        if (finalData.length > 0 && chartRef.current) {
          chartRef.current.timeScale().fitContent()
          chartRef.current.priceScale('right').setAutoScale(true)
        }
      })
      .catch(e => {
        console.log(e)
      })
      .finally(() => {
        setChartLoading(false)
      })
  }, [chartPoolData?.address?.toString(), chartInterval, isXtoY, triggerReload])

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
              {tokenFrom !== null && tokenTo !== null ? (
                <Grid container item className={classes.iconsAndNames}>
                  <Grid container item className={classes.iconsShared}>
                    <Grid display='flex' position='relative'>
                      <img
                        className={classes.tokenIcon}
                        src={isXtoY ? tokenFrom.logoURI : tokenTo.logoURI}
                        alt={isXtoY ? tokenFrom.symbol : tokenTo.symbol}
                      />
                      {(isXtoY ? tokenFrom.isUnknown : tokenTo.isUnknown) && (
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
                          setIsXtoY(!isXtoY)
                        }}
                      />
                    </TooltipHover>
                    <Grid display='flex' position='relative'>
                      <img
                        className={classes.tokenIcon}
                        src={isXtoY ? tokenTo.logoURI : tokenFrom.logoURI}
                        alt={isXtoY ? tokenTo.symbol : tokenFrom.symbol}
                      />
                      {(isXtoY ? tokenTo.isUnknown : tokenFrom.isUnknown) && (
                        <img className={classes.warningIcon} src={warningIcon} />
                      )}
                    </Grid>
                  </Grid>

                  <Box className={classes.tickersContainer}>
                    <Typography className={classes.names}>
                      {isXtoY ? tokenFrom.symbol : tokenTo.symbol} -{' '}
                      {isXtoY ? tokenTo.symbol : tokenFrom.symbol}
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                <Typography className={classes.names}>Select tokens</Typography>
              )}
            </Grid>
            {tokenFrom !== null && tokenTo !== null && (
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
                      noData={false}
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
            )}
          </Grid>
        </Box>
        <Grid flex={isMd ? 'none' : '1 1 0'}>
          {(tokenFrom && tokenTo) || chartLoading || isLoading ? (
            <Grid style={{ position: 'relative', height: '100%' }}>
              <div ref={containerRef} className={classes.chart} />

              {(chartLoading || isLoading) && (
                <Grid container className={classes.cover}>
                  <img src={loader} className={classes.loader} alt='Loader' />
                </Grid>
              )}

              {(isNoData || !chartPoolData?.address?.toString()) &&
                !(chartLoading || isLoading) && (
                  <Grid container className={classes.cover}>
                    <Typography sx={{ ...typography.body3 }} color={colors.invariant.textGrey}>
                      No pool data found
                    </Typography>
                  </Grid>
                )}
            </Grid>
          ) : (
            <EmptyPlaceholder
              height={'100%'}
              newVersion
              mainTitle={'Select tokens'}
              desc={'Not found pool data'}
              withButton={false}
              roundedCorners
            />
          )}
        </Grid>
      </Box>
    </Grid>
  )
}

export default Chart
