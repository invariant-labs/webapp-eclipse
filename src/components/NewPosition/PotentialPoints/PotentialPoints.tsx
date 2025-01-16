import { Box, Grid, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useStyles } from './style'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors, typography } from '@static/theme'
import icons from '@static/icons'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'
import { BN } from '@coral-xyz/anchor'
import { formatNumber, printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

export interface IPotentialPoints {
  handleClickFAQ: () => void
  concentrationArray: number[]
  concentrationIndex: number
  estimatedPointsPerDay: BN
  isConnected: boolean
}

export const PotentialPoints: React.FC<IPotentialPoints> = ({
  handleClickFAQ,
  concentrationArray,
  concentrationIndex,
  estimatedPointsPerDay,
  isConnected
}) => {
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
    : formatNumber(printBN(estimatedPointsPerDay, LEADERBOARD_DECIMAL))

  return (
    <Box mt={4} mb={8}>
      <GradientBorder borderRadius={24} borderWidth={2}>
        <Grid display='flex' className={classNames(classes.wrapper)}>
          <Grid className={classes.column}>
            <Grid container alignItems='center' justifyContent='space-between'>
              <Grid display='flex' gap={1}>
                <Typography style={typography.heading4}>Potential Points</Typography>
                <Grid
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  className={classes.pointsLabel}
                  height={24}>
                  <img src={icons.airdropRainbow} alt={'Airdrop'} style={{ height: '12px' }} />
                  <Typography style={typography.caption2}>
                    Points: <span className={classes.pinkText}>{pointsPerDayFormat}</span>
                  </Typography>
                </Grid>
              </Grid>
              <Grid>
                <button className={classes.questionButton} onClick={handleClickFAQ}>
                  <img src={icons.infoIconPink} alt='i' width={14} style={{ marginRight: '8px' }} />
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
            <Typography style={(typography.caption1, { position: 'relative' })}>
              Your Potential Points: &nbsp;
              <span className={classes.pinkText}>
                {pointsPerDayFormat} &nbsp;
                <TooltipGradient title='PDD - Points Per 24H' top={-10}>
                  <span>PDD</span>
                </TooltipGradient>
              </span>
            </Typography>
            <Box className={classes.darkBackground}>
              <Box className={classes.gradientProgress} />
            </Box>
            <Grid container justifyContent='space-between' alignItems='center'>
              <Grid
                display='flex'
                flexDirection='column'
                gap={1}
                style={(typography.caption1, { color: colors.invariant.textGrey })}>
                <Typography>{minConc}x</Typography>
                <Typography>
                  <span>{1}</span>{' '}
                  <TooltipGradient title='PDD - Points Per 24H' top={-10}>
                    <span>PDD</span>
                  </TooltipGradient>
                </Typography>
              </Grid>
              <Grid
                display='flex'
                flexDirection='column'
                gap={1}
                style={
                  (typography.caption1, { color: colors.invariant.textGrey, textAlign: 'center' })
                }>
                <Typography>{middleConc}x</Typography>
                <Typography>
                  <span>{1}</span>{' '}
                  <TooltipGradient title='PDD - Points Per 24H' top={-10}>
                    <span>PDD</span>
                  </TooltipGradient>
                </Typography>
              </Grid>
              <Grid
                display='flex'
                flexDirection='column'
                gap={1}
                style={
                  (typography.caption1, { color: colors.invariant.textGrey, textAlign: 'right' })
                }>
                <Typography>{maxConc}x</Typography>
                <Typography>
                  <span>{1}</span>{' '}
                  <TooltipGradient title='PDD - Points Per 24H' top={-10}>
                    <span>PDD</span>
                  </TooltipGradient>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </GradientBorder>
    </Box>
  )
}

export default PotentialPoints
