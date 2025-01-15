import { Box, Grid, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useStyles } from './style'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors, typography } from '@static/theme'
import icons from '@static/icons'

export interface IPotentialPoints {}

export const PotentialPoints: React.FC<IPotentialPoints> = () => {
  const [showTooltip, setShowTooltip] = React.useState(false)

  const { classes } = useStyles()
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
                    Points: <span className={classes.pinkText}>{123.32}</span>
                  </Typography>
                </Grid>
              </Grid>
              <Grid>
                <button className={classes.questionButton}>
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
                {12333} &nbsp;
                <span
                  className={classes.tooltipHover}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}>
                  PDD
                </span>
              </span>
              {showTooltip && (
                <Grid className={classes.tooltipContainer}>
                  <GradientBorder borderRadius={14} borderWidth={1}>
                    <Grid className={classes.tooltip}>PDD - Points Per 24H</Grid>
                  </GradientBorder>
                </Grid>
              )}
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
                <Typography>1x</Typography>
                <Typography>1x</Typography>
              </Grid>
              <Grid
                display='flex'
                flexDirection='column'
                gap={1}
                mt={1}
                style={
                  (typography.caption1, { color: colors.invariant.textGrey, textAlign: 'center' })
                }>
                <Typography>2000x</Typography>
                <Typography>1x</Typography>
              </Grid>
              <Grid
                display='flex'
                flexDirection='column'
                gap={1}
                style={
                  (typography.caption1, { color: colors.invariant.textGrey, textAlign: 'right' })
                }>
                <Typography>45666x</Typography>
                <Typography>1x</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </GradientBorder>
    </Box>
  )
}

export default PotentialPoints
