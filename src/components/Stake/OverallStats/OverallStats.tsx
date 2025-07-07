import { Box, Typography, useMediaQuery } from '@mui/material'
import { colors, theme } from '@static/theme'
import sBITZ from '@static/png/sBitz.png'
import BITZ from '@static/png/bitz.png'
import SupplyChart from './Charts/sBITZSupplyChart/SupplyChart'
import { BITZ_MAIN, Intervals, sBITZ_MAIN } from '@store/consts/static'
import { Separator } from '@common/Separator/Separator'
import { useStyles } from './style'
import { TimeData } from '@store/reducers/sbitz-stats'
import { formatNumberWithoutSuffix, printBN } from '@utils/utils'

interface Props {
  isLoadingStats: boolean
  sbitzSupply: string
  bitzStaked: string
  sbitzPlot: TimeData[]
  bitzPlot: TimeData[]
}
export const OverallStats = ({
  isLoadingStats,
  sbitzPlot,
  bitzPlot,
  bitzStaked,
  sbitzSupply
}: Props) => {
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
              <Typography className={classes.statsValue}>
                {formatNumberWithoutSuffix(
                  isLoadingStats ? Math.random() * 10000 : printBN(sbitzSupply, sBITZ_MAIN.decimals)
                )}
              </Typography>
            </Box>
            <Box className={classes.iconContainer}>
              <img src={sBITZ} alt='sBITZ' className={classes.tokenIcon} />
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <SupplyChart
              isLoading={isLoadingStats}
              interval={Intervals.Daily}
              data={sbitzPlot}
              color={colors.invariant.lightBlue}
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
              <Typography className={classes.statsTitle}>BITZ staked</Typography>
              <Typography className={classes.statsValue}>
                {formatNumberWithoutSuffix(
                  isLoadingStats ? Math.random() * 10000 : +printBN(bitzStaked, BITZ_MAIN.decimals)
                )}
              </Typography>
            </Box>
            <Box className={classes.iconContainer}>
              <img src={BITZ} alt='BITZ' className={classes.tokenIcon} />
            </Box>
          </Box>
          <Box className={classes.chartContainer}>
            <SupplyChart
              isLoading={isLoadingStats}
              interval={Intervals.Daily}
              data={bitzPlot}
              color={colors.invariant.green}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
