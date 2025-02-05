import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useStyles } from './style'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { theme, typography } from '@static/theme'
import icons from '@static/icons'
import { BN } from '@coral-xyz/anchor'
import { formatNumber, printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

export interface IEstimatedPoints {
  handleClickFAQ: () => void
  concentrationArray: number[]
  concentrationIndex: number
  estimatedPointsPerDay: BN
  estimatedScalePoints: { min: BN; middle: BN; max: BN }
  isConnected: boolean
  showWarning: boolean
}

export const EstimatedPoints: React.FC<IEstimatedPoints> = ({
  handleClickFAQ,
  concentrationArray,
  concentrationIndex,
  estimatedPointsPerDay,
  isConnected,
  estimatedScalePoints,
  showWarning
}) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const { minConc, middleConc, maxConc } = useMemo(() => {
    return {
      minConc: concentrationArray[0].toFixed(0),
      middleConc: concentrationArray[Math.floor(concentrationArray.length / 2)].toFixed(0),
      maxConc: concentrationArray[concentrationArray.length - 1].toFixed(0)
    }
  }, [concentrationArray])

  const percentage = useMemo(() => {
    return +((concentrationIndex * 100) / (concentrationArray.length - 1)).toFixed(0)
  }, [concentrationIndex])

  const { classes } = useStyles({
    percentage: percentage
  })

  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }

  const pointsPerDayFormat: string | number = isLessThanMinimal(estimatedPointsPerDay)
    ? isConnected && !estimatedPointsPerDay.isZero()
      ? '<0.01'
      : 0
    : formatNumber(printBN(estimatedPointsPerDay, LEADERBOARD_DECIMAL), false, 1)

  const estimatedPointsForScaleFormat = useMemo(() => {
    const minPoints = isLessThanMinimal(estimatedScalePoints.min)
      ? isConnected && !estimatedScalePoints.min.isZero()
        ? '<0.01'
        : 0
      : formatNumber(printBN(estimatedScalePoints.min, LEADERBOARD_DECIMAL))

    const middlePoints = isLessThanMinimal(estimatedScalePoints.middle)
      ? isConnected && !estimatedScalePoints.middle.isZero()
        ? '<0.01'
        : 0
      : formatNumber(printBN(estimatedScalePoints.middle, LEADERBOARD_DECIMAL))

    const maxPoints = isLessThanMinimal(estimatedScalePoints.max)
      ? isConnected && !estimatedScalePoints.max.isZero()
        ? '<0.01'
        : 0
      : formatNumber(printBN(estimatedScalePoints.max, LEADERBOARD_DECIMAL))

    return {
      min: minPoints,
      middle: middlePoints,
      max: maxPoints
    }
  }, [estimatedScalePoints])

  return (
    <Box mt={3} mb={4}>
      <GradientBorder borderRadius={24} borderWidth={2}>
        <Grid className={classNames(classes.wrapper)}>
          <Grid display='flex' gap={3} className={classNames(classes.innerWrapper)}>
            <Grid className={classes.column}>
              <Grid container className={classes.leftHeaderItems}>
                <Grid display='flex' gap={1} alignItems='center'>
                  <Typography style={{ textWrap: 'nowrap', ...typography.heading4 }}>
                    Estimated Points
                  </Typography>
                  <Grid
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    className={classes.pointsLabel}
                    height={24}
                    flexWrap='nowrap'>
                    <img src={icons.airdropRainbow} alt={'Airdrop'} style={{ height: '12px' }} />
                    <Typography noWrap>
                      Points: <span className={classes.pinkText}>{pointsPerDayFormat}</span>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid className={classes.rightHeaderItems}>
                  <button className={classes.questionButton} onClick={handleClickFAQ}>
                    <img
                      src={icons.infoIconPink}
                      alt='i'
                      width={14}
                      style={{ marginRight: '4px' }}
                    />
                    <Typography
                      display='inline'
                      className={classNames(classes.pinkText, classes.link)}>
                      How to get more points?
                    </Typography>
                  </button>
                </Grid>
              </Grid>
              <Typography className={classes.description}>
                Points you accrue depend on the concentration of your position. Adjust the
                concentration slider to see how many points your current position will accrue.
              </Typography>
            </Grid>
            <Grid className={classes.column}>
              <Typography className={classes.estimatedPoints}>
                <span>Your Estimated Points: &nbsp;</span>
                <span className={classes.pinkText}>{pointsPerDayFormat} Points/24h</span>
              </Typography>
              <Grid display='flex' justifyContent='space-between' container mt={1}>
                <Typography className={classes.sliderLabel}>{minConc}x</Typography>
                <Typography className={classes.sliderLabel}>{middleConc}x</Typography>
                <Typography className={classes.sliderLabel}>{maxConc}x</Typography>
              </Grid>
              <Box className={classes.darkBackground}>
                <Box className={classes.gradientProgress} />
              </Box>

              {!showWarning ? (
                <Grid container justifyContent='space-between' alignItems='center'>
                  <Typography
                    display='flex'
                    flexDirection={isSm ? 'column' : 'row'}
                    className={classes.sliderLabel}>
                    {estimatedPointsForScaleFormat.min} {isSm ? <span>Pts/24h</span> : 'Points/24h'}
                  </Typography>
                  <Typography
                    display='flex'
                    alignItems='center'
                    flexDirection={isSm ? 'column' : 'row'}
                    className={classes.sliderLabel}>
                    {estimatedPointsForScaleFormat.middle}{' '}
                    {isSm ? <span>Pts/24h</span> : 'Points/24h'}
                  </Typography>
                  <Typography
                    display='flex'
                    alignItems='flex-end'
                    flexDirection={isSm ? 'column' : 'row'}
                    className={classes.sliderLabel}>
                    {estimatedPointsForScaleFormat.max} {isSm ? <span>Pts/24h</span> : 'Points/24h'}
                  </Typography>
                </Grid>
              ) : (
                <Grid container height={isMd ? 0 : 17} />
              )}
            </Grid>
          </Grid>
          {showWarning ? (
            <Typography
              display='flex'
              mt={isSm ? '24px' : '16px'}
              alignItems='center'
              columnGap={2}>
              <img
                width={20}
                src={icons.warning2}
                alt='Warning icon'
                style={{ minWidth: '20px' }}
              />
              <span className={classes.warningText}>
                First, enter your deposit amounts to estimate your points per day
              </span>
            </Typography>
          ) : (
            <Grid container height={isMd ? 0 : 40} />
          )}
        </Grid>
      </GradientBorder>
    </Box>
  )
}

export default EstimatedPoints
