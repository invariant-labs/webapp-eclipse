import { Box, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import {
  formatNumberWithCommas,
  formatNumberWithSuffix,
  printBN,
  removeAdditionalDecimals
} from '@utils/utils'
import classNames from 'classnames'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

type Props = {
  value: number
  pendingFees: number
  poolApr: number
  points24: number
  arePointsDistributed: boolean
  isLoading: boolean
}

export const PositionStats = ({
  value,
  pendingFees,
  poolApr,
  points24,
  arePointsDistributed,
  isLoading
}: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
      <Box className={classes.statWrapper}>
        <Box className={classes.statContainer}>
          <Typography className={classes.statName}>Value:</Typography>
          <Typography className={classes.statValue}>
            $
            {+formatNumberWithSuffix(value, true, 18) < 1000
              ? (+formatNumberWithSuffix(value, true, 18)).toFixed(2)
              : formatNumberWithSuffix(value)}
          </Typography>
        </Box>
        <Box className={classes.statContainer}>
          <Typography className={classes.statName}>Pending fees:</Typography>
          {isLoading ? (
            <Skeleton variant='rounded' width={36} height={17} />
          ) : (
            <Typography className={classes.statValue}>
              $
              {+formatNumberWithSuffix(pendingFees, true, 18) < 1000
                ? (+formatNumberWithSuffix(pendingFees, true, 18)).toFixed(2)
                : formatNumberWithSuffix(pendingFees)}
            </Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.statWrapper}>
        <Box className={classNames(classes.statContainer, classes.statCOntainerRainbow)}>
          {arePointsDistributed ? (
            <>
              <Typography className={classes.statName}>Points 24H:</Typography>
              <Typography className={classes.statValue}>
                {+removeAdditionalDecimals(
                  formatNumberWithCommas(printBN(points24, LEADERBOARD_DECIMAL)),
                  2
                ) === 0
                  ? '<0.01'
                  : removeAdditionalDecimals(
                      formatNumberWithCommas(printBN(points24, LEADERBOARD_DECIMAL)),
                      2
                    )}
              </Typography>
            </>
          ) : (
            <Typography className={classes.statName}>No points distribution</Typography>
          )}
        </Box>
        <Box className={classNames(classes.statContainer, classes.statContainerHiglight)}>
          <Typography className={classes.statName}>Pool APR:</Typography>
          <Typography className={classNames(classes.statValue, classes.statValueHiglight)}>
            {poolApr.toFixed(2)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
