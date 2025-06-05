import { Box, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import { formatNumberWithSuffix } from '@utils/utils'
import { Intervals } from '@store/consts/static'
import { mapIntervalToString } from '@utils/uiUtils'

type Props = {
  tvl: number
  volume24: number
  fee24: number
  showPoolDetailsLoader: boolean
  interval: Intervals
}

export const PoolDetails = ({ tvl, volume24, fee24, showPoolDetailsLoader, interval }: Props) => {
  const { classes } = useStyles()
  const intervalSuffix = mapIntervalToString(interval)

  return (
    <Box className={classes.container}>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>TVL</Typography>
        <Typography className={classes.statDescription}>
          {showPoolDetailsLoader ? (
            <Skeleton variant='rounded' width={40} height={17} />
          ) : (
            <>
              $
              {+formatNumberWithSuffix(tvl, { noDecimals: true, decimalsAfterDot: 18 }) < 1000
                ? (+formatNumberWithSuffix(tvl, {
                    noDecimals: true,
                    decimalsAfterDot: 18
                  })).toFixed(2)
                : formatNumberWithSuffix(tvl)}
            </>
          )}
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>{intervalSuffix} Volume</Typography>
        <Typography className={classes.statDescription}>
          {showPoolDetailsLoader ? (
            <Skeleton variant='rounded' width={40} height={17} />
          ) : (
            <>
              $
              {+formatNumberWithSuffix(volume24, { noDecimals: true, decimalsAfterDot: 18 }) < 1000
                ? (+formatNumberWithSuffix(volume24, {
                    noDecimals: true,
                    decimalsAfterDot: 18
                  })).toFixed(2)
                : formatNumberWithSuffix(volume24)}
            </>
          )}
        </Typography>
      </Box>
      <Box className={classes.stat}>
        <Typography className={classes.statTitle}>{intervalSuffix} Fee</Typography>
        <Typography className={classes.statDescription}>
          {showPoolDetailsLoader ? (
            <Skeleton variant='rounded' width={40} height={17} />
          ) : (
            <>
              $
              {+formatNumberWithSuffix(fee24, { noDecimals: true, decimalsAfterDot: 18 }) < 1000
                ? (+formatNumberWithSuffix(fee24, {
                    noDecimals: true,
                    decimalsAfterDot: 18
                  })).toFixed(2)
                : formatNumberWithSuffix(fee24)}
            </>
          )}
        </Typography>
      </Box>
    </Box>
  )
}
