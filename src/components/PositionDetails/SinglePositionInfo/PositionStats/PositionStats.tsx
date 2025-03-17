import { Box, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import { formatNumberWithSuffix } from '@utils/utils'
import classNames from 'classnames'

type Props = {
  value: number
  pendingFees: number
  poolApr: number
  isLoading: boolean
}

export const PositionStats = ({ value, pendingFees, poolApr, isLoading }: Props) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.container}>
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
      <Box className={classNames(classes.statContainer, classes.statContainerHiglighted)}>
        <Typography className={classes.statName}>Pool APR:</Typography>
        <Typography className={classNames(classes.statValue, classes.statValueHiglighted)}>
          {poolApr.toFixed(2)}%
        </Typography>
      </Box>
    </Box>
  )
}
