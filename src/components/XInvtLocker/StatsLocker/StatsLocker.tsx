import { Box, Typography } from '@mui/material'
import useStyles from './style'
import { Separator } from '@common/Separator/Separator'
import { colors } from '@static/theme'

export const StatsLocker = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.statsWrapper}>
      <Typography component='h5'>Your Stats</Typography>
      <Box className={classes.yourStatsBoxesWrapper}>
        <Box className={classes.statsBox}>
          <Typography component='h3'>3 months yield</Typography>
          <Typography component='h2'>10 %</Typography>
        </Box>
        <Box className={classes.statsBox}>
          <Typography component='h3'>Total INVT staked</Typography>
          <Typography component='h2'>$2,933,732.38</Typography>
        </Box>
      </Box>
      <Separator isHorizontal color={colors.invariant.light} size={'100%'} width={1} />
      <Typography component='h5'>Global Stats</Typography>
      <Box className={classes.singleBoxStat}>
        <Typography component='h3'>Your INVT staked</Typography>
        <Typography component='h2'>73,238 INVT</Typography>
      </Box>
      <Box className={classes.yourStatsBoxesWrapper}>
        <Box className={classes.globalStatsBox}>
          <Typography component='h3'>Your share</Typography>
          <Typography component='h2'>7.23%</Typography>
        </Box>
        <Box className={classes.globalStatsBox}>
          <Typography component='h3'>Lock period</Typography>
          <Typography component='h2'>3 months</Typography>
        </Box>
      </Box>
    </Box>
  )
}
