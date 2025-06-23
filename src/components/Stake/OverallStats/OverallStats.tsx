import { Box, Typography, useMediaQuery } from '@mui/material'
import { colors, theme } from '@static/theme'
import sBITZ from '@static/png/sBitz.png'
import BITZ from '@static/png/bitz.png'
import SupplyChart from './Charts/sBITZSupplyChart/SupplyChart'
import { Intervals } from '@store/consts/static'
import { Separator } from '@common/Separator/Separator'
import { useStyles } from './style'

export const OverallStats = () => {
  const { classes, cx } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box className={classes.container}>
      <Typography className={classes.heading}>Overall stats</Typography>

      <Box
        className={cx(
          classes.contentBox,
          isMd ? classes.contentBoxMobile : classes.contentBoxDesktop
        )}>
        <Box className={classes.sectionContainer}>
          <Box className={classes.statsHeader}>
            <Box className={classes.textContainer}>
              <Typography className={classes.statsTitle}>sBITZ supply</Typography>
              <Typography className={classes.statsValue}>$2,472,938.34</Typography>
            </Box>
            <Box className={classes.iconContainer}>
              <img src={sBITZ} alt='sBITZ' className={classes.tokenIcon} />
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <SupplyChart
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

        <Separator
          color={colors.invariant.light}
          margin={isMd ? '0 0px' : '0 24px'}
          width={1}
          isHorizontal={isMd}
        />

        <Box className={classes.sectionContainer}>
          <Box className={classes.statsHeader}>
            <Box className={classes.textContainer}>
              <Typography className={classes.statsTitle}>BITZ Supply</Typography>
              <Typography className={classes.statsValue}>$2,472,938.34</Typography>
            </Box>
            <Box className={classes.iconContainer}>
              <img src={BITZ} alt='BITZ' className={classes.tokenIcon} />
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <SupplyChart
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
