import React, { useEffect, useMemo, useRef } from 'react'
import useStyles from './style'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { CandlestickSeries, ColorType, createChart, ISeriesApi } from 'lightweight-charts'
import { networkTypetoProgramNetwork } from '@utils/web3/connection'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from '@store/consts/static'
import { getMarketAddress } from '@invariant-labs/sdk-eclipse'
import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'
import { Pair } from '@invariant-labs/sdk-eclipse/src'
import { fetchBestPoolAddress, fetchData } from '@utils/utils'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { colors, theme, typography } from '@static/theme'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { swapListIcon, warningIcon } from '@static/icons'
import { FeeSelector } from './FeeSelector/FeeSelector'
import Intervals from '@components/Stats/Intervals/Intervals'

interface iProps {
  tokenFromIndex: number | null
  tokenToIndex: number | null
  tokens: SwapToken[]
  network: NetworkType
  isLoading: boolean
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  feeTierIndex: number
  feeTiersWithTvl: Record<number, number>
  isDisabled: boolean
  disabledFeeTiers: string[]
  interval: IntervalsKeys
  noData: boolean
  xToY: boolean
  setXToY: (a: boolean) => void
  updateInterval: (interval: IntervalsKeys) => void
}

const Chart: React.FC<iProps> = ({
  tokenFromIndex,
  tokenToIndex,
  tokens,
  network,
  disabledFeeTiers,
  feeTierIndex,
  feeTiers,
  feeTiersWithTvl,
  interval,
  // isDisabled,
  isLoading,
  selectFeeTier,
  noData,
  xToY,
  setXToY,
  updateInterval
}) => {
  const { classes } = useStyles()
  // const isTablet = useMediaQuery(theme.breakpoints.down(1200))
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const promotedPoolTierIndex = useMemo(() => {
    if (tokenFromIndex === null || tokenToIndex === null) return undefined

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
  }, [tokenFromIndex, tokenToIndex, tokens.length])

  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>()

  useEffect(() => {
    if (!containerRef.current) return
    if (tokenFromIndex === null || tokenToIndex === null || tokenFromIndex === tokenToIndex) return

    const net = networkTypetoProgramNetwork(network)
    const marketAddress = new PublicKey(getMarketAddress(net))
    const tokenFrom = tokens[tokenFromIndex].assetAddress.toString()
    const tokenTo = tokens[tokenToIndex].assetAddress.toString()
    const tokenX = tokenFrom < tokenTo ? tokenFrom : tokenTo
    const tokenY = tokenFrom < tokenTo ? tokenTo : tokenFrom
    const addresses = FEE_TIERS.map(fee =>
      new Pair(new PublicKey(tokenX), new PublicKey(tokenY), fee)
        .getAddress(marketAddress)
        .toString()
    )

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
      rightPriceScale: { borderColor: '#374151' },
      timeScale: { borderColor: '#374151' }
    })

    seriesRef.current = chart.addSeries(CandlestickSeries)

    fetchBestPoolAddress(addresses)
      .then(bestAddr => {
        if (!bestAddr) return fetchData(addresses[0])
        return fetchData(bestAddr)
      })
      .then(data => {
        const sorted = data.sort((a, b) => a.time - b.time)
        const deduped = sorted.filter(
          (candle, idx) => idx === 0 || candle.time > sorted[idx - 1].time
        )

        seriesRef.current?.setData(deduped)

        if (deduped.length > 0) {
          const N = Math.min(100, deduped.length)
          const from = deduped[deduped.length - N].time
          const to = deduped[deduped.length - 1].time
          chart.timeScale().setVisibleRange({ from, to })
        }
      })
      .catch(e => console.log(e))

    return () => {
      chart.remove()
    }
  }, [tokenFromIndex, tokenToIndex, tokens])

  const { tokenXIcon, tokenXName, isUnknownX } = useMemo(() => {
    if (tokenFromIndex === null) return { tokenXIcon: '' }

    return {
      tokenXIcon: tokens[tokenFromIndex].logoURI,
      tokenXName: tokens[tokenFromIndex].symbol,
      isUnknownX: tokens[tokenFromIndex].isUnknown
    }
  }, [tokens.length, tokenFromIndex])

  const { tokenYIcon, tokenYName, isUnknownY } = useMemo(() => {
    if (tokenToIndex === null) return { tokenYIcon: '' }

    return {
      tokenYIcon: tokens[tokenToIndex].logoURI,
      tokenYName: tokens[tokenToIndex].symbol,
      isUnknownY: tokens[tokenToIndex].isUnknown
    }
  }, [tokens.length, tokenToIndex])

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
                      src={xToY ? tokenXIcon : tokenYIcon}
                      alt={xToY ? tokenXName : tokenYName}
                    />
                    {(xToY ? isUnknownX : isUnknownY) && (
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
                      src={xToY ? tokenYIcon : tokenXIcon}
                      alt={xToY ? tokenYName : tokenXName}
                    />
                    {(xToY ? isUnknownY : isUnknownX) && (
                      <img className={classes.warningIcon} src={warningIcon} />
                    )}
                  </Grid>
                </Grid>

                <Box className={classes.tickersContainer}>
                  <Typography className={classes.names}>
                    {xToY ? tokenXName : tokenYName} - {xToY ? tokenYName : tokenXName}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Grid flex={1}>
              <Typography
                sx={{ ...typography.body2, color: colors.invariant.textGrey }}
                mb={'12px'}
                textAlign={'end'}>
                Chart is updated every 20 minutes
              </Typography>

              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} gap={2}>
                <FeeSelector
                  onSelect={selectFeeTier}
                  feeTiers={feeTiers}
                  currentFeeIndex={feeTierIndex}
                  promotedPoolTierIndex={promotedPoolTierIndex}
                  feeTiersWithTvl={feeTiersWithTvl}
                  disabledFeeTiers={disabledFeeTiers}
                  noData={noData}
                  isLoading={isLoading}
                  tokenX={tokenFromIndex ? tokens[tokenFromIndex] : null}
                  tokenY={tokenToIndex ? tokens[tokenToIndex] : null}
                />
                <Box display={'flex'} width={isSm ? '100%' : 'auto'}>
                  <Intervals
                    interval={interval ?? IntervalsKeys.Daily}
                    setInterval={updateInterval}
                    dark
                    fullWidth={isSm}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <div ref={containerRef} className={classes.chart} />
      </Box>
    </Grid>
  )
}

export default Chart
