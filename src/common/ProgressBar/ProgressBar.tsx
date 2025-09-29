import { Box, Grid, Skeleton, Typography } from '@mui/material'
import useStyles from './styles'

interface ProgressBarProps {
  percentage: number
  loading: boolean
  gap?: number | string
  top?: number | string
  progressBarColor?: string
  centerTextColor?: string
  displayCenterText?: boolean
  startUnit?: string
  startValue?: string
  endUnit?: string
  endValue?: string
  height?: string | number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  loading,
  gap,
  progressBarColor,
  centerTextColor,
  displayCenterText = true,
  startValue = '0',
  endValue = '100',
  endUnit = '%',
  startUnit = '%',
  top,
  height
}) => {
  const { classes } = useStyles({ percentage, progressBarColor, centerTextColor, height })
  return (
    <Grid display='flex' flexDirection='column' gap={gap || 2} marginTop={top}>
      <Box className={classes.darkBackground}>
        <Box className={classes.gradientProgress} />
      </Box>
      <Grid container className={classes.barWrapper}>
        <Typography className={classes.sliderLabel}>
          {startValue}
          {startUnit}
        </Typography>
        {displayCenterText &&
          (loading ? (
            <Skeleton height={20} width={60} variant='rounded' sx={{ borderRadius: '8px' }} />
          ) : (
            <Typography className={classes.colorSliderLabel}>
              {percentage.toFixed(2)}
              {endUnit}
            </Typography>
          ))}
        <Typography className={classes.sliderLabel}>
          {endValue}
          {endUnit}
        </Typography>
      </Grid>
    </Grid>
  )
}
