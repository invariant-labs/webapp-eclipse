import React, { useMemo, useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { TokenPositionEntry } from '@store/types/userOverview'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { isLoadingPositionsList } from '@store/selectors/positions'
import { useSelector } from 'react-redux'
import SegmentFragmentTooltip from '../SegmentFragmentTooltip/SegmentFragmentTooltip'
import { useStyles } from './styles'
import MobileOverviewSkeleton from '../Overview/skeletons/MobileOverviewSkeleton'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import icons from '@static/icons'
export interface ChartSegment {
  start: number
  width: number
  color: string
  token: string
  value: number
  logo: string | undefined
  percentage: string
  isPriceWarning: boolean
}

interface MobileOverviewProps {
  sortedTokens: TokenPositionEntry[]
  totalAssets: { value: number; isPriceWarning: boolean }
  chartColors: string[]
}

const MobileOverview: React.FC<MobileOverviewProps> = ({
  sortedTokens,
  totalAssets,
  chartColors
}) => {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const { classes } = useStyles()

  const sortedChartColors = useMemo(() => {
    const colorMap = sortedTokens.reduce((map, position, index) => {
      map.set(position.token, chartColors[index])
      return map
    }, new Map<string, string>())

    return sortedTokens.map(position => colorMap.get(position.token) ?? '')
  }, [sortedTokens, chartColors])

  const segments: ChartSegment[] = useMemo(() => {
    let currentPosition = 0

    return sortedTokens.map((position, index) => {
      const percentage = (position.value / totalAssets.value) * 100
      const segment = {
        start: currentPosition,
        width: percentage,
        color: sortedChartColors[index],
        token: position.token,
        value: position.value || 0,
        logo: position.logo,
        percentage: percentage.toFixed(2),
        isPriceWarning: position.isPriceWarning && position.value > 0
      }
      currentPosition += percentage
      return segment
    })
  }, [sortedTokens, totalAssets, sortedChartColors])

  return (
    <Box className={classes.container}>
      {isLoadingList ? (
        <MobileOverviewSkeleton />
      ) : (
        <>
          <Box className={classes.chartContainer}>
            {segments.map((segment, index) => (
              <SegmentFragmentTooltip
                key={segment.token}
                tooltipClasses={{ tooltip: classes.tooltip }}
                segment={segment}
                selectedSegment={selectedSegment}
                setSelectedSegment={setSelectedSegment}
                index={index}
              />
            ))}
          </Box>
          {segments.length > 0 ? (
            <Box className={classes.tokenSection}>
              <Typography className={classes.tokenTitle}>Tokens</Typography>

              <Grid container className={classes.tokenGrid}>
                {segments.map(segment => (
                  <Grid item container key={segment.token} className={classes.tokenGridItem}>
                    <Grid item xs={4} className={classes.tokenLogoContainer}>
                      <img src={segment.logo} alt={'Token logo'} className={classes.tokenLogo} />
                      <Typography className={classes.tokenSymbol} sx={{ color: segment.color }}>
                        {segment.token}:
                      </Typography>
                    </Grid>

                    <Grid item xs={7}>
                      <Typography className={classes.tokenValue}>
                        ${formatNumberWithoutSuffix(segment.value, { twoDecimals: true })}
                      </Typography>
                      {segment.isPriceWarning && (
                        <TooltipHover title='The price might not be shown correctly'>
                          <img src={icons.warning2} width={14} />
                        </TooltipHover>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  )
}

export default MobileOverview
