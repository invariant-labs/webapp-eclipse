import { Box, Typography, useMediaQuery } from '@mui/material'
import { colors, theme } from '@static/theme'
// import sBITZ from '@static/png/sBitz.png'
import TVLChart from '../OverallStats/Charts/sBITZTVLChart/TVLChart'
import { Intervals, sBITZ_MAIN } from '@store/consts/static'
import { Separator } from '@common/Separator/Separator'
import { useStyles } from './style'
import ResponsivePieChart from '@components/Portfolio/Overview/OverviewPieChart/ResponsivePieChart'
import { TokenArc } from '../TokenArc/TokenArc'
import { TimeData } from '@store/reducers/sbitz-stats'
import { formatNumberWithoutSuffix, printBN } from '@utils/utils'
import { useMemo } from 'react'

interface Props {
  isLoadingStats: boolean
  bitzStaked: string
  totalBitzStaked: string
  bitzSupply: string
  sbitzTvl: number
  tvlPlot: TimeData[]
}
export const StakedStats = ({
  isLoadingStats,
  bitzStaked,
  bitzSupply,
  totalBitzStaked,
  tvlPlot,
  sbitzTvl
}: Props) => {
  //   bitzStaked = '4912342300000000' // only for testing
  const { classes, cx } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const { stakedPercentage, directStakePercentage } = useMemo(() => {
    const allBitzStaked = +printBN(totalBitzStaked, sBITZ_MAIN.decimals)
    const bitz = +printBN(bitzStaked, sBITZ_MAIN.decimals)
    const ratio = (bitz / allBitzStaked) * 100
    const stakedPercentage = isNaN(ratio) ? '0' : ratio > 0.01 ? ratio.toFixed(2) : '<0.01'
    const directStakePercentage = isNaN(+stakedPercentage) ? '99.99' : 100 - +stakedPercentage
    return { stakedPercentage, directStakePercentage }
  }, [totalBitzStaked, bitzStaked])

  return (
    <Box className={classes.container}>
      <Box
        className={cx(
          classes.contentBox,
          isMd ? classes.contentBoxMobile : classes.contentBoxDesktop
        )}>
        <Box className={classes.sectionContainer}>
          <Box className={classes.statsBox}>
            <Box className={classes.statsContent}>
              <Box className={classes.statsSection}>
                <Typography className={classes.statsLabel}>BITZ staked</Typography>
                <Typography className={classes.statsValue}>
                  {formatNumberWithoutSuffix(
                    isLoadingStats
                      ? Math.random() * 10000
                      : printBN(bitzStaked, sBITZ_MAIN.decimals)
                  )}
                </Typography>
              </Box>

              <Box className={classes.tokenArcsSection}>
                <Box className={classes.flexBoxWithGap}>
                  <Box className={classes.arcContainer}>
                    <TokenArc color={colors.invariant.lightBlue} width={65} height={98} />
                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                      <Typography className={classes.tokenName}>sBITZ</Typography>
                      <Typography className={classes.tokenPercentageBlue}>
                        {stakedPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.arcContainer}>
                    <TokenArc color={colors.invariant.green} width={65} height={98} />
                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                      <Typography className={classes.tokenName}>BITZ</Typography>
                      <Typography className={classes.tokenPercentageGreen}>
                        {directStakePercentage}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className={classes.statsSection}>
                <Typography className={classes.statsLabel}>BITZ supply</Typography>
                <Typography className={classes.statsValue}>
                  {' '}
                  {formatNumberWithoutSuffix(
                    isLoadingStats
                      ? Math.random() * 10000
                      : printBN(bitzSupply, sBITZ_MAIN.decimals)
                  )}
                </Typography>
              </Box>
            </Box>

            <Box className={classes.pieChartSection}>
              <ResponsivePieChart
                isLoading={isLoadingStats}
                data={[
                  { label: 'sBITZ', value: isNaN(+stakedPercentage) ? 0 : +stakedPercentage },
                  {
                    label: 'BITZ',
                    value: isNaN(+directStakePercentage) ? 0 : +directStakePercentage
                  }
                ]}
                chartColors={[colors.invariant.lightBlue, colors.invariant.green]}
                tooltipPrefix=''
              />
            </Box>
          </Box>
        </Box>

        <Separator
          color={colors.invariant.light}
          margin={isMd ? '0 0px' : '0 24px'}
          width={1}
          isHorizontal={isMd}
        />

        <Box className={classes.sectionContainer}>
          <Box className={classes.statsHeader}>
            <Box className={classes.textContainer}>
              <Typography className={classes.statsTitle}>sBITZ TVL</Typography>
              <Typography className={classes.statsValue}>
                ${formatNumberWithoutSuffix(isLoadingStats ? Math.random() * 10000 : sbitzTvl)}
              </Typography>
            </Box>
            <Box className={classes.iconContainer}>
              {/* <img src={sBITZ} alt='sBITZ' className={classes.tokenIcon} /> */}
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <TVLChart isLoading={isLoadingStats} interval={Intervals.Daily} data={tvlPlot} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
