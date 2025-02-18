import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { useStyles } from './styles'
import { ProcessedPool } from '@store/types/userOverview'
import { useSelector } from 'react-redux'
import { theme } from '@static/theme'
import ResponsivePieChart from '../OverviewPieChart/ResponsivePieChart'
import { isLoadingPositionsList, positionsWithPoolsData } from '@store/selectors/positions'
import { getTokenPrice } from '@utils/utils'
import MobileOverview from './MobileOverview'
import LegendSkeleton from './skeletons/LegendSkeleton'
import { useAverageLogoColor } from '@store/hooks/userOverview/useAverageLogoColor'
import { useAgregatedPositions } from '@store/hooks/userOverview/useAgregatedPositions'
import { useCalculateUnclaimedFee } from '@store/hooks/userOverview/useCalculateUnclaimedFee'
import icons from '@static/icons'
import { LegendOverview } from './LegendOverview'

interface OverviewProps {
  poolAssets: ProcessedPool[]
  isLoading?: boolean
}

export const Overview: React.FC<OverviewProps> = () => {
  const { classes } = useStyles()
  const positionList = useSelector(positionsWithPoolsData)
  const isLg = useMediaQuery(theme.breakpoints.down('lg'))
  const isLoadingList = useSelector(isLoadingPositionsList)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [logoColors, setLogoColors] = useState<Record<string, string>>({})
  const [pendingColorLoads, setPendingColorLoads] = useState<Set<string>>(new Set())

  const totalUnclaimedFee = useCalculateUnclaimedFee(positionList, prices)
  const { getAverageColor, getTokenColor, tokenColorOverrides } = useAverageLogoColor()
  const { positions } = useAgregatedPositions(positionList, prices)

  const isColorsLoading = useMemo(() => pendingColorLoads.size > 0, [pendingColorLoads])

  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => b.value - a.value)
  }, [positions])

  const chartColors = useMemo(
    () =>
      sortedPositions.map(position =>
        getTokenColor(position.token, logoColors[position.logo ?? ''] ?? '', tokenColorOverrides)
      ),
    [sortedPositions, logoColors, getTokenColor, tokenColorOverrides]
  )

  const totalAssets = useMemo(
    () => positions.reduce((acc, position) => acc + position.value, 0),
    [positions]
  )

  const isDataReady = !isLoadingList && !isColorsLoading && Object.keys(prices).length > 0

  const data = useMemo(() => {
    if (!isDataReady) return []

    const tokens: { label: string; value: number }[] = []
    sortedPositions.forEach(position => {
      const existingToken = tokens.find(token => token.label === position.token)
      if (existingToken) {
        existingToken.value += position.value
      } else {
        tokens.push({
          label: position.name,
          value: position.value
        })
      }
    })
    return tokens
  }, [sortedPositions, isDataReady])

  useEffect(() => {
    const loadPrices = async () => {
      const uniqueTokens = new Set<string>()
      positionList.forEach(position => {
        uniqueTokens.add(position.tokenX.assetAddress.toString())
        uniqueTokens.add(position.tokenY.assetAddress.toString())
      })

      const tokenArray = Array.from(uniqueTokens)
      const priceResults = await Promise.all(
        tokenArray.map(async token => ({
          token,
          price: await getTokenPrice(token)
        }))
      )

      const newPrices = priceResults.reduce(
        (acc, { token, price }) => ({
          ...acc,
          [token]: price ?? 0
        }),
        {}
      )

      setPrices(newPrices)
    }

    loadPrices()
  }, [positionList])

  useEffect(() => {
    sortedPositions.forEach(position => {
      if (position.logo && !logoColors[position.logo] && !pendingColorLoads.has(position.logo)) {
        setPendingColorLoads(prev => new Set(prev).add(position.logo ?? ''))

        getAverageColor(position.logo, position.name)
          .then(color => {
            setLogoColors(prev => ({
              ...prev,
              [position.logo ?? '']: color
            }))
            setPendingColorLoads(prev => {
              const next = new Set(prev)
              next.delete(position.logo ?? '')
              return next
            })
          })
          .catch(error => {
            console.error('Error getting color for logo:', error)
            setPendingColorLoads(prev => {
              const next = new Set(prev)
              next.delete(position.logo ?? '')
              return next
            })
          })
      }
    })
  }, [sortedPositions, getAverageColor, logoColors, pendingColorLoads])

  const EmptyState = ({ classes }: { classes: any }) => (
    <Box className={classes.emptyState}>
      <img src={icons.empty} alt='Empty portfolio' height={64} width={64} />
      <Typography className={classes.emptyStateText}>Your portfolio is empty.</Typography>
    </Box>
  )

  if (!isLoadingList && positions.length === 0) {
    return (
      <Box className={classes.container}>
        <HeaderSection totalValue={0} loading={false} />
        <UnclaimedSection unclaimedTotal={0} loading={false} />
        <EmptyState classes={classes} />
      </Box>
    )
  }

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalAssets} loading={isLoadingList} />
      <UnclaimedSection unclaimedTotal={totalUnclaimedFee} loading={isLoadingList} />

      {isLg ? (
        <MobileOverview
          positions={sortedPositions}
          totalAssets={totalAssets}
          chartColors={chartColors}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            [theme.breakpoints.down('lg')]: {
              justifyContent: 'center',
              flexDirection: 'column'
            }
          }}>
          <Box sx={{ width: '850px' }}>
            {!isDataReady ? (
              <LegendSkeleton />
            ) : (
              <LegendOverview
                logoColors={logoColors}
                sortedPositions={sortedPositions}
                tokenColorOverrides={tokenColorOverrides}
              />
            )}
          </Box>

          <Box
            sx={{
              flex: '1 1 100%',
              minHeight: 'fit-content',
              [theme.breakpoints.down('lg')]: {
                marginTop: '100px'
              }
            }}>
            <ResponsivePieChart data={data} chartColors={chartColors} isLoading={!isDataReady} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
