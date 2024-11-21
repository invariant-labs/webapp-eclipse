import { ILiquidityToken } from '@components/PositionDetails/SinglePositionInfo/consts'
import useStyles from './style'
import { Button, Grid, Popover, Tooltip, Typography } from '@mui/material'
import warningExclamationMarkCircle from '@static/svg/warningExclamationMarkCircle.svg'
import icons from '@static/icons'
import { formatNumber } from '@utils/utils'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'

export interface ILockLiquidityModal {
  open: boolean
  xToY: boolean
  tokenX: ILiquidityToken
  tokenY: ILiquidityToken
  onClose: () => void
  onLock: () => void
  fee: string
  minMax: string
  value: string
  isActive: boolean
  swapHandler: () => void
}
export const LockLiquidityModal = ({
  open,
  xToY,
  tokenX,
  tokenY,
  onClose,
  onLock,
  fee,
  minMax,
  value,
  isActive,
  swapHandler
}: ILockLiquidityModal) => {
  const { classes } = useStyles()

  return (
    <Popover
      classes={{ paper: classes.paper }}
      open={open}
      onClose={onClose}
      className={classes.popover}
      anchorReference='none'
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid container className={classes.backgroundContainer}>
        <Grid container className={classes.container}>
          <Grid item className={classes.lockPositionHeader}>
            <Typography component='h1'>Locking your position</Typography>
            <Button className={classes.lockPositionClose} onClick={onClose} aria-label='Close' />
          </Grid>
          <Typography className={classes.lockExplanation}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse euismod, diam a
            egestas pretium, ex massa blandit libero, ac dignissim magna nulla a nunc. Fusce
            eleifend leo massa, id consectetur massa lacinia sit amet. Phasellus sit amet facilisis
            metus. Integer sed tellus vel purus varius vehicula. Donec hendrerit ultricies erat eu
            vulputate. Donec nisi mauris, ullamcorper ac sollicitudin eget, cursus eu sapien. Ut
            sollicitudin leo nec suscipit malesuada. Nulla facilisi. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Suspendisse euismod, diam a egestas pretium, ex massa
            blandit libero, ac dignissim magna nulla a nunc.
          </Typography>
          <Grid item container className={classes.pairInfo}>
            <Grid item className={classes.pairDisplay}>
              <Grid item className={classes.icons}>
                <img
                  className={classes.icon}
                  src={xToY ? tokenX.icon : tokenY.icon}
                  alt={xToY ? tokenX.name : tokenY.name}
                />{' '}
                <TooltipHover text='Reverse tokens'>
                  <img
                    className={classes.arrowIcon}
                    src={icons.swapListIcon}
                    alt='to'
                    onClick={swapHandler}
                  />
                </TooltipHover>
                <img
                  className={classes.icon}
                  src={xToY ? tokenY.icon : tokenX.icon}
                  alt={xToY ? tokenY.name : tokenX.name}
                />
              </Grid>
              <Typography className={classes.name}>
                {xToY ? tokenX.name : tokenY.name} - {xToY ? tokenY.name : tokenX.name}
              </Typography>
            </Grid>
            <Grid item className={classes.pairDetails}>
              <Grid item container className={classes.pairValues}>
                <Grid item className={classes.pairFee}>
                  <Tooltip
                    title={
                      isActive ? (
                        <>
                          The position is <b>active</b> and currently <b>earning a fee</b> as long
                          as the current price is <b>within</b> the position's price range.
                        </>
                      ) : (
                        <>
                          The position is <b>inactive</b> and <b>not earning a fee</b> as long as
                          the current price is <b>outside</b> the position's price range.
                        </>
                      )
                    }
                    placement='top'
                    classes={{
                      tooltip: classes.tooltip
                    }}>
                    <Typography>{fee}</Typography>
                  </Tooltip>
                </Grid>
                <Grid item className={classes.pairRange}>
                  <Typography className={classes.normalText}>
                    {xToY
                      ? `${formatNumber(tokenX.liqValue)} ${tokenX.name} - ${formatNumber(tokenY.liqValue)} ${tokenY.name}`
                      : `${formatNumber(tokenY.liqValue)} ${tokenY.name} - ${formatNumber(tokenX.liqValue)} ${tokenX.name}`}
                  </Typography>
                </Grid>
                <Grid item className={classes.pairValue}>
                  <Typography className={classes.normalText}>Value</Typography>
                  <Typography className={classes.greenText}>{value}</Typography>
                </Grid>
              </Grid>
              <Grid item className={classes.pairMinMax}>
                <Typography className={classes.greenText}>MIN-MAX</Typography>
                <Typography className={classes.normalText}>{minMax}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.lockWarning}>
            <img src={warningExclamationMarkCircle} alt='' />
            <Typography className={classes.lockWarningText}>
              Lorem ipsum... This action is irrevirsible! Do you want to proceed? Lorem ipsum...
            </Typography>
          </Grid>
          <Button className={classes.lockButton} variant='contained' onClick={onLock}>
            <span className={classes.buttonText}>Lock Position!</span>
          </Button>
        </Grid>
      </Grid>
    </Popover>
  )
}
export default LockLiquidityModal
