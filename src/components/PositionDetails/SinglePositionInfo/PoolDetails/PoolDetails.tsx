import { Box, Typography } from '@mui/material'
import { useStyles } from './style'
import { formatNumberWithSuffix } from '@utils/utils'

type Props = {
  tvl: number
  volume24: number
  fee24: number
}

export const PoolDetails = ({ tvl, volume24, fee24 }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>TVL</Typography>
        <Typography className={classes.statDescription}>
          $
          {+formatNumberWithSuffix(tvl, true, 18) < 1000
            ? (+formatNumberWithSuffix(tvl, true, 18)).toFixed(2)
            : formatNumberWithSuffix(tvl)}
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>24H Volume</Typography>
        <Typography className={classes.statDescription}>
          $
          {+formatNumberWithSuffix(volume24, true, 18) < 1000
            ? (+formatNumberWithSuffix(volume24, true, 18)).toFixed(2)
            : formatNumberWithSuffix(volume24)}
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>24H Fee</Typography>
        <Typography className={classes.statDescription}>
          $
          {+formatNumberWithSuffix(fee24, true, 18) < 1000
            ? (+formatNumberWithSuffix(fee24, true, 18)).toFixed(2)
            : formatNumberWithSuffix(fee24)}
        </Typography>
      </Box>
    </Box>
  )
}
