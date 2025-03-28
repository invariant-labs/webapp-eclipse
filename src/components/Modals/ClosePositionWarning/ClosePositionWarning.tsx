import React from 'react'
import useStyles from './styles'
import { Button, Grid, Popover, Typography } from '@mui/material'

export interface IProps {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onClaim: () => void
}
export const ClosePositionWarning: React.FC<IProps> = ({ open, onCancel, onClose, onClaim }) => {
  const { classes } = useStyles()

  return (
    <Popover
      classes={{ paper: classes.paper }}
      className={classes.popover}
      open={open}
      anchorReference='none'
      onClose={onCancel}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid container className={classes.root}>
        <Grid className={classes.upperRow} container>
          <Typography className={classes.title}>Warning!</Typography>
          <Button className={classes.close} onClick={onCancel}>
            {'\u2715'}
          </Button>
        </Grid>
        <Typography className={classes.desc}>
          This position is staked on our farms. If you close it before claiming rewards, you will be
          unable to do it after.
        </Typography>
        <Button className={classes.cancelButton} onClick={onCancel}>
          Cancel
        </Button>
        <Button className={classes.closeButton} onClick={onClose}>
          Close position
        </Button>
        <Button className={classes.claimButton} onClick={onClaim}>
          Claim farms rewards and close position
        </Button>
      </Grid>
    </Popover>
  )
}
export default ClosePositionWarning
