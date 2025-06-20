import React, { useRef, useEffect } from 'react'
import { createChart, ISeriesApi, UTCTimestamp, CandlestickSeries } from 'lightweight-charts'

interface Candle {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TradingViewChartProps {
  network: string
  poolAddress: string
  timeframe: 'day' | 'hour' | 'minute'
  aggregate?: number
  beforeTimestamp?: number
  limit?: number
  currency?: 'usd' | 'token'
  includeEmptyIntervals?: boolean
  token?: string
  chartOptions?: Partial<Parameters<ReturnType<typeof createChart>['applyOptions']>[0]>
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  network,
  poolAddress,
  timeframe,
  aggregate = 1,
  beforeTimestamp,
  limit = 1000,
  currency = 'token',
  includeEmptyIntervals = false,
  token = 'quote',
  chartOptions = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>()

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      ...chartOptions
    })

    seriesRef.current = chart.addSeries(CandlestickSeries)

    fetchData()
      .then(data => {
        const sorted = data.sort((a, b) => a.time - b.time)
        seriesRef.current?.setData(sorted)
        chart.timeScale().fitContent()
      })
      .catch(console.error)

    const handleResize = () => {
      chart.applyOptions({ width: containerRef.current!.clientWidth })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }

    async function fetchData(): Promise<Candle[]> {
      const params = new URLSearchParams({
        aggregate: String(aggregate),
        limit: String(limit),
        currency,
        include_empty_intervals: String(includeEmptyIntervals),
        token
      })
      if (beforeTimestamp) params.set('before_timestamp', String(beforeTimestamp))

      const url =
        `https://api.geckoterminal.com/api/v2/networks/${network}` +
        `/pools/${poolAddress}/ohlcv/${timeframe}?${params.toString()}`

      const res = await fetch(url)
      const json = await res.json()
      const list: any[][] = json.data.attributes.ohlcv_list

      return list.map(([time, open, high, low, close, volume]) => ({
        time: time as UTCTimestamp,
        open,
        high,
        low,
        close,
        volume
      }))
    }
  }, [
    network,
    poolAddress,
    timeframe,
    aggregate,
    beforeTimestamp,
    limit,
    currency,
    includeEmptyIntervals,
    token,
    chartOptions
  ])

  return <div ref={containerRef} style={{ width: '100%' }} />
}

export default TradingViewChart
