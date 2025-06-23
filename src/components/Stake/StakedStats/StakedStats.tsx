import { Box, Typography, useMediaQuery } from '@mui/material'
import { colors, theme } from '@static/theme'
import sBITZ from '@static/png/sBitz.png'
import TVLChart from '../OverallStats/Charts/sBITZTVLChart/TVLChart'
import { Intervals } from '@store/consts/static'
import { Separator } from '@common/Separator/Separator'
import { useStyles } from './style'
import ResponsivePieChart from '@components/Portfolio/Overview/OverviewPieChart/ResponsivePieChart'
import { TokenArc } from '../TokenArc/TokenArc'

export const StakedStats = () => {
  const { classes, cx } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

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
                <Typography className={classes.statsValue}>0.00</Typography>
              </Box>

              <Box className={classes.tokenArcsSection}>
                <Box className={classes.flexBoxWithGap}>
                  <Box className={classes.arcContainer}>
                    <TokenArc color={'#00D9FF'} width={65} height={98} />
                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                      <Typography className={classes.tokenName}>sBITZ</Typography>
                      <Typography className={classes.tokenPercentageBlue}>61%</Typography>
                    </Box>
                  </Box>
                  <Box className={classes.arcContainer}>
                    <TokenArc color={'#32EC51'} width={65} height={98} />
                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                      <Typography className={classes.tokenName}>BITZ</Typography>
                      <Typography className={classes.tokenPercentageGreen}>39%</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box className={classes.statsSection}>
                <Typography className={classes.statsLabel}>BITZ supply</Typography>
                <Typography className={classes.statsValue}>0.00</Typography>
              </Box>
            </Box>

            <Box className={classes.pieChartSection}>
              <ResponsivePieChart
                isLoading={false}
                data={[
                  { label: 'sBITZ', value: 61 },
                  { label: 'BITZ', value: 39 }
                ]}
                chartColors={['#00D9FF', '#32EC51']}
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
              <Typography className={classes.statsValue}>$2,472,938.34</Typography>
            </Box>
            <Box className={classes.iconContainer}>
              <img src={sBITZ} alt='sBITZ' className={classes.tokenIcon} />
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <TVLChart
              lastStatsTimestamp={1750604221}
              isLoading={false}
              interval={Intervals.Daily}
              data={[
                { timestamp: 1710604221, value: 4.32 },
                { timestamp: 1750603221, value: 24.32 },
                { timestamp: 1850603221, value: 34.32 }
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
