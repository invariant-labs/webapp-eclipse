import { Grid, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { arrowRightIcon, closeSmallIcon, infoCircleIcon, newTabIcon } from '@static/icons'
import { Button } from '@common/Button/Button'
import { Separator } from '@common/Separator/Separator'
import { colors, theme } from '@static/theme'
import cardLarge from '@static/png/Eclipse-USDC.png'
import cardSmall from '@static/png/Eclipse-USDC-small.png'
import React from 'react'
import { ROUTES } from '@utils/utils'
import { useNavigate } from 'react-router-dom'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { ES_MAIN, USDC_MAIN } from '@store/consts/static'

interface IECBanner {
  isCloseButton?: boolean
  page: 'overview' | 'points'
  isHiding?: boolean
  handleCloseBanner?: () => void
}

export const ECBanner: React.FC<IECBanner> = ({
  isCloseButton = true,
  page,
  isHiding = false,
  handleCloseBanner = () => {}
}) => {
  const navigate = useNavigate()
  const allocationTooltipTitle = (
    <Grid>
      <Typography>$ES Allocation</Typography>
      <br />
      Eclipse has officially launched its token!
      <br />
      Check your eligibility and claim your
      <br />
      allocation on the official Eclipse claim site.
    </Grid>
  )
  const earnTooltipTitle = (
    <Grid>
      <Typography>Put your $ES to work and keep earning!</Typography>
      <br />
      Believe in Eclipse and the long-term value of $ES? <br />
      Don’t let your tokens sit idle in your wallet.
      <br />
      Provide liquidity to the ES-USDC pool and start
      <br />
      earning trading fees, Invariant Points, and exclusive
      <br />
      benefits from projects across the entire ecosystem.
    </Grid>
  )
  const breakpoint = page === 'points' ? theme.breakpoints.values.lg : 1200
  const changeDirection = useMediaQuery(theme.breakpoints.down(breakpoint))
  const { classes } = useStyles({ breakpoint, isHiding })
  return (
    <Grid className={classes.mainWrapper}>
      {isCloseButton && (
        <img className={classes.closeIcon} src={closeSmallIcon} onClick={handleCloseBanner} />
      )}
      <Grid className={classes.leftWrapper}>
        <Typography className={classes.header}>
          Your Allocation{' '}
          <TooltipHover gradient placement='top' top={1} title={allocationTooltipTitle}>
            <img src={infoCircleIcon} />
          </TooltipHover>
        </Typography>

        <Typography component='span'>
          Eclipse just launched their tokens! You can check your eligibility and claim tokens on
          official Eclipse claim site. You are just one click away from it!
        </Typography>
        <Button
          onClick={() => window.open('http://claims.eclipse.xyz/')}
          scheme='green'
          gap={8}
          width={200}
          height={36}>
          Claim
          <img className={classes.newTab} src={newTabIcon} />
        </Button>
      </Grid>
      <Separator isHorizontal={changeDirection} size={'100%'} color={colors.invariant.light} />
      <Grid className={classes.rightWrapper}>
        <Grid className={classes.buttonSection}>
          {changeDirection ? (
            <Grid>
              <Typography className={classes.header}>Use ES token to earn trading</Typography>{' '}
              <TooltipHover center gradient title={earnTooltipTitle} top={1}>
                <Typography className={classes.header}>
                  fees and points <img src={infoCircleIcon} />
                </Typography>
              </TooltipHover>
            </Grid>
          ) : (
            <Typography className={classes.header}>
              Use ES token to earn trading fees and points{' '}
              <TooltipHover gradient title={earnTooltipTitle} top={1}>
                <img src={infoCircleIcon} />
              </TooltipHover>
            </Typography>
          )}
          <Typography component='span'>
            Want to change your assets to actions? <br /> Click the button below to create your ES -
            USDC {changeDirection && <br />} position and enjoy your never ending fees!
          </Typography>
          <Button
            onClick={() =>
              navigate(ROUTES.getNewPositionRoute(ES_MAIN.symbol, USDC_MAIN.symbol, '0_30'))
            }
            scheme='pink'
            gap={8}
            width={200}
            height={36}>
            Provide liquidity
            <img className={classes.arrowRight} src={arrowRightIcon} />
          </Button>
        </Grid>
        <img className={classes.card} src={changeDirection ? cardSmall : cardLarge} />
      </Grid>
    </Grid>
  )
}
