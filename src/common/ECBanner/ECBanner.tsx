import { Grid, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import icons from '@static/icons'
import { Button } from '@common/Button/Button'
import { Separator } from '@common/Separator/Separator'
import { colors, theme } from '@static/theme'
import cardLarge from '@static/png/Eclipse-USDC.png'
import cardSmall from '@static/png/Eclipse-USDC-small.png'
import React from 'react'

interface IECBanner {
  isCloseButton?: boolean
  page: 'overview' | 'points'
}

export const ECBanner: React.FC<IECBanner> = ({ isCloseButton = true, page }) => {
  const changeDirection = useMediaQuery(theme.breakpoints.down('lg'))
  const { classes } = useStyles({ page })
  return (
    <Grid className={classes.mainWrapper}>
      {isCloseButton && <img className={classes.closeIcon} src={icons.closeSmallIcon} />}{' '}
      <Grid className={classes.leftWrapper}>
        <Typography className={classes.header}>
          Your Allocation <img src={icons.infoCircle} />
        </Typography>

        <Typography component='span'>
          Eclipse just launched their tokens! You can check your eligibility and claim tokens on
          official Eclipse claim site. You are just one click away from it!
        </Typography>
        <Button scheme='green' gap={8} width={200} height={36}>
          Claim
          <img className={classes.newTab} src={icons.newTab} />
        </Button>
      </Grid>
      <Separator isHorizontal={changeDirection} size={'100%'} color={colors.invariant.light} />
      <Grid className={classes.rightWrapper}>
        <Grid className={classes.buttonSection}>
          {changeDirection ? (
            <Grid>
              <Typography className={classes.header}>Use ECLS tokens to earn trading</Typography>{' '}
              <Typography className={classes.header}>
                fees and points <img src={icons.infoCircle} />
              </Typography>
            </Grid>
          ) : (
            <Typography className={classes.header}>
              Use ECLS tokens to earn trading fees and points <img src={icons.infoCircle} />
            </Typography>
          )}
          <Typography component='span'>
            Want to change your assets to actions? <br /> Click the button below to create your ES -
            USDC {changeDirection && <br />} position and enjoy your never ending fees!
          </Typography>
          <Button scheme='pink' gap={8} width={200} height={36}>
            Provide liquidity
            <img className={classes.arrowRight} src={icons.arrowRight} />
          </Button>
        </Grid>
        <img className={classes.card} src={changeDirection ? cardSmall : cardLarge} />
      </Grid>
    </Grid>
  )
}
