import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useStyles } from './style'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { theme, typography } from '@static/theme'
import icons from '@static/icons'
import { BN } from '@coral-xyz/anchor'
import { calculateConcentration, formatNumber, printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { PositionOpeningMethod } from '@store/consts/types'

export interface IEstimatedPoints {
  handleClickFAQ: () => void
  concentrationArray: number[]
  concentrationIndex: number
  estimatedPointsPerDay: BN
  estimatedScalePoints: { min: BN; middle: BN; max: BN }
  isConnected: boolean
  showWarning: boolean
  singleDepositWarning: boolean
  positionOpeningMethod: PositionOpeningMethod
  tickSpacing: number
}

export const EstimatedPoints: React.FC<IEstimatedPoints> = ({
  handleClickFAQ,
  concentrationArray,
  concentrationIndex,
  estimatedPointsPerDay,
  isConnected,
  estimatedScalePoints,
  showWarning,
  singleDepositWarning,
  positionOpeningMethod,
  tickSpacing
}) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const maxConcForRange = calculateConcentration(0, tickSpacing)

  const { minConc, middleConc, maxConc } = useMemo(
    () => ({
      minConc: positionOpeningMethod === 'concentration' ? concentrationArray[0].toFixed(0) : 1,
      middleConc: concentrationArray[Math.floor(concentrationArray.length / 2)].toFixed(0),
      maxConc:
        positionOpeningMethod === 'concentration'
          ? concentrationArray[concentrationArray.length - 1].toFixed(0)
          : Math.ceil(maxConcForRange)
    }),
    [concentrationArray, positionOpeningMethod]
  )

  const warningText = useMemo(() => {
    if (singleDepositWarning) {
      return 'Points are not available for single-asset positions'
    } else if (showWarning) {
      return 'First, enter your deposit amounts to estimate your points per day'
    } else return ''
  }, [showWarning, singleDepositWarning])

  const rangeConcentrationArray = useMemo(() => {
    const rangeConcentration = [...concentrationArray]
    rangeConcentration.unshift(1)
    rangeConcentration.push(2 * +concentrationArray[concentrationArray.length - 1].toFixed(0))

    return rangeConcentration
  }, [concentrationArray])

  const closestMultiplierForRangeMode = useMemo(() => {
    const minValue = +printBN(estimatedScalePoints.min, LEADERBOARD_DECIMAL)
    const maxValue = +printBN(estimatedScalePoints.max, LEADERBOARD_DECIMAL)
    const estimatedPoints = +printBN(estimatedPointsPerDay, LEADERBOARD_DECIMAL)

    const lastMultiplier = rangeConcentrationArray[rangeConcentrationArray.length - 1]
    const exponent = Math.log(maxValue / minValue) / Math.log(lastMultiplier)

    const valuesArray = rangeConcentrationArray.map(m => minValue * Math.pow(m, exponent))

    let closestIndex = 0
    let smallestDiff = Math.abs(valuesArray[0] - estimatedPoints)

    for (let i = 1; i < valuesArray.length; i++) {
      const diff = Math.abs(valuesArray[i] - estimatedPoints)
      if (diff < smallestDiff) {
        smallestDiff = diff
        closestIndex = i
      }
    }

    return closestIndex
  }, [rangeConcentrationArray, estimatedScalePoints])

  const percentage = useMemo(
    () =>
      showWarning || singleDepositWarning
        ? 0
        : positionOpeningMethod === 'concentration'
          ? +((concentrationIndex * 100) / (concentrationArray.length - 1)).toFixed(0)
          : +((closestMultiplierForRangeMode * 100) / (rangeConcentrationArray.length - 1)).toFixed(
              0
            ),
    [
      closestMultiplierForRangeMode,
      rangeConcentrationArray,
      concentrationIndex,
      concentrationArray,
      warningText.length,
      estimatedPointsPerDay.toString(),
      estimatedScalePoints.max.toString()
    ]
  )

  const { classes } = useStyles({ percentage })

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
  }, [estimatedScalePoints, isConnected])

  return (
    <Box mt={3} mb={4}>
      <GradientBorder borderRadius={24} borderWidth={2}>
        <Grid className={classNames(classes.wrapper)}>
          <Grid display='flex' gap={3} className={classNames(classes.innerWrapper)} spacing={3}>
            <Grid className={classes.column}>
              <Grid container direction='column' spacing={1} className={classes.leftHeaderItems}>
                <Grid item>
                  <Grid display='flex' gap={1} alignItems='center' justifyContent={'space-between'}>
                    <Typography style={{ whiteSpace: 'nowrap', ...typography.heading4 }}>
                      Estimated Points
                    </Typography>
                    <Grid
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      className={classes.pointsLabel}
                      flexWrap='nowrap'>
                      <img
                        src={icons.airdropRainbow}
                        alt='Airdrop'
                        style={{ height: '16px', marginLeft: '-8px' }}
                      />
                      <Typography noWrap>
                        Points: <span className={classes.pinkText}>{pointsPerDayFormat}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Typography className={classes.description}>
                  Points you accrue depend on the concentration of your position. Adjust the
                  concentration slider to see how many points your current position will accrue.{' '}
                  <button className={classes.questionButton} onClick={handleClickFAQ}>
                    <img
                      src={icons.infoIconPink}
                      alt='i'
                      width={14}
                      style={{ marginLeft: '-2px', marginRight: '4px', marginBottom: '-2px' }}
                    />
                    <Typography
                      display='inline'
                      className={classNames(classes.pinkText, classes.link)}>
                      How to get more points?
                    </Typography>
                  </button>
                </Typography>
              </Grid>
            </Grid>
            <Grid className={classes.column} style={{ alignItems: 'center' }}>
              <Typography
                style={{ whiteSpace: 'nowrap', ...typography.heading4, fontSize: '18px' }}>
                <span>Your Estimated Points: &nbsp;</span>
                <span className={classes.pinkText}>
                  {singleDepositWarning ? 0 : pointsPerDayFormat} Points/24h
                </span>
              </Typography>
              <Grid display='flex' justifyContent='space-between' container mt={1}>
                <Typography className={classes.sliderLabel}>{minConc}x</Typography>
                <Typography className={classes.sliderLabel}>{middleConc}x</Typography>
                <Typography className={classes.sliderLabel}>{maxConc}x</Typography>
              </Grid>
              <Box className={classes.darkBackground}>
                <Box className={classes.gradientProgress} />
              </Box>

              {!warningText ? (
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
          {warningText ? (
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
              <span className={classes.warningText}>{warningText}</span>
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
