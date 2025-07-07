import { Box, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import {
  formatNumberWithCommas,
  formatNumberWithSuffix,
  printBN,
  removeAdditionalDecimals
} from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

type Props = {
  value: number
  pendingFees: number
  poolApy: number
  points24: number
  arePointsDistributed: boolean
  isLoading: boolean
  isPromotedLoading: boolean
  isLocked?: boolean
  showPoolDetailsLoader?: boolean
}

export const PositionStats = ({
  value,
  pendingFees,
  poolApy,
  points24,
  arePointsDistributed,
  isLoading,
  isPromotedLoading,
  isLocked = false,
  showPoolDetailsLoader = false
}: Props) => {
  const { classes, cx } = useStyles()

  return (
    <Box className={classes.container}>
      <Box className={classes.statWrapper}>
        <Box className={classes.statContainer}>
          <Typography className={classes.statName}>Value:</Typography>
          {isLoading ? (
            <Skeleton variant='rounded' width={38} height={17} />
          ) : (
            <Typography className={classes.statValue}>
              $
              {+formatNumberWithSuffix(value, { noDecimals: true, decimalsAfterDot: 18 }) < 1000
                ? (+formatNumberWithSuffix(value, {
                    noDecimals: true,
                    decimalsAfterDot: 18
                  })).toFixed(2)
                : formatNumberWithSuffix(value)}
            </Typography>
          )}
        </Box>
        <Box className={classes.statContainer}>
          <Typography className={classes.statName}>Pending fees:</Typography>
          {isLoading ? (
            <Skeleton variant='rounded' width={36} height={17} />
          ) : (
            <Typography className={classes.statValue}>
              $
              {+formatNumberWithSuffix(pendingFees, { noDecimals: true, decimalsAfterDot: 18 }) <
              1000
                ? (+formatNumberWithSuffix(pendingFees, {
                    noDecimals: true,
                    decimalsAfterDot: 18
                  })).toFixed(2)
                : formatNumberWithSuffix(pendingFees)}
            </Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.statWrapper}>
        <Box className={cx(classes.statContainer, classes.statCOntainerRainbow)}>
          {isLoading || isPromotedLoading ? (
            <Skeleton height={20} width={140} variant='rounded' />
          ) : arePointsDistributed && !isLocked ? (
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
        <Box className={cx(classes.statContainer, classes.statContainerHiglight)}>
          <Typography className={classes.statName}>Pool APY:</Typography>
          {showPoolDetailsLoader ? (
            <Skeleton height={17} width={36} variant='rounded' />
          ) : (
            <Typography className={cx(classes.statValue, classes.statValueHiglight)}>
              {poolApy.toFixed(2)}%
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
