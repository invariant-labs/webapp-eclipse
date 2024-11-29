import { ILiquidityToken } from '@components/PositionDetails/SinglePositionInfo/consts'
import useStyles from './style'
import { Button, Grid, Popover, Tooltip, Typography } from '@mui/material'
import warningExclamationMarkCircle from '@static/svg/warningExclamationMarkCircle.svg'
import icons from '@static/icons'
import { formatNumber } from '@utils/utils'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

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
  success: boolean
  inProgress: boolean
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
  swapHandler,
  success,
  inProgress
}: ILockLiquidityModal) => {
  const { classes } = useStyles()
  const [progress, setProgress] = useState<ProgressState>('none')

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1000)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
      }, 3000)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

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
            <Typography component='h1'>Lock Position</Typography>
            <Button className={classes.lockPositionClose} onClick={onClose} aria-label='Close' />
          </Grid>
          <Typography className={classes.lockExplanation}>
            <Typography className={classes.lockParagraph}>
              <b>Are you sure you want to lock your liquidity permanently?</b> Once locked, you will
              no longer be able to withdraw tokens from this position. Locking liquidity is often
              used for specific purposes, such as protecting against rug pulls.
            </Typography>
            <Typography className={classes.lockParagraph}>
              Before locking, double-check the parameters of your position (e.g., price range and
              fee tier). These settings cannot be changed once the position is locked. If you need
              to adjust the parameters, you can close and reopen the position with the correct
              settings before locking.
            </Typography>
            <Typography className={classes.lockParagraph}>
              The Invariant locker allows the wallet that locks the position to claim any fees
              accumulated from swaps
            </Typography>
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
              Once locked, the position cannot be closed, and the tokens cannot be withdrawn. Please
              ensure you fully understand the consequences before proceeding.
            </Typography>
          </Grid>
          <AnimatedButton
            content={'Lock Position'}
            className={classNames(
              classes.lockButton,
              progress === 'none' ? classes.buttonText : null
            )}
            onClick={() => {
              onLock()
              setProgress('progress')
            }}
            progress={progress}
          />
        </Grid>
      </Grid>
    </Popover>
  )
}
export default LockLiquidityModal
