import useStyles from './style'
import { Box, Button, Divider, Grid, Hidden, Popover, Typography } from '@mui/material'
import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

export interface IRefferalModal {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  success: boolean
  inProgress: boolean
  referrerAddress: string
}
export const ReferralModal = ({
  open,
  onClose,
  onConfirm,
  success,
  inProgress,
  referrerAddress
}: IRefferalModal) => {
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
          <Grid item className={classes.referralModalHeader}>
            <Typography component='h1'>Confirm your invitation</Typography>
            <Button className={classes.referralModalClose} onClick={onClose} aria-label='Close' />
          </Grid>
          <Grid item className={classes.infoContainer}>
            <Grid item className={classes.referrerContainer}>
              <Typography className={classes.greySmallText}>
                You have been invited to join the Invariant Points program by:
              </Typography>
              <Typography className={classes.whiteBigText}>{referrerAddress}</Typography>
            </Grid>
            <Typography className={classes.greySmallText}>
              Please confirm the use of this referral code. You can only use one code per wallet.
            </Typography>
            <Grid className={classes.splittedContainer}>
              <Box className={classes.splittedContainerItem}>
                <Typography className={classes.greySmallText}>You'll get:</Typography>
                <Typography className={classes.whiteSmallText}>• 10% discount on fees</Typography>
                <Typography className={classes.whiteSmallText}>• Benefit</Typography>
              </Box>
              <Hidden mdDown>
                <Divider orientation='vertical' flexItem className={classes.divider} />
              </Hidden>
              <Box className={classes.splittedContainerItem}>
                <Typography className={classes.greySmallText}>Your friend'll get:</Typography>
                <Typography className={classes.whiteSmallText}>
                  • 10% of your total points
                </Typography>
                <Typography className={classes.whiteSmallText}>• Benefit</Typography>
              </Box>
            </Grid>
            <AnimatedButton
              content={'Confirm'}
              className={classNames(
                classes.confirmButton,
                progress === 'none' ? classes.buttonText : null
              )}
              onClick={() => {
                onConfirm()
                setProgress('progress')
              }}
              progress={progress}
            />
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  )
}
export default ReferralModal
