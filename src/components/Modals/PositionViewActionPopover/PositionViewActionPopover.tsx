import React from 'react'
import classNames from 'classnames'
import useStyles from './style'
import { Grid, Popover, Typography } from '@mui/material'

export interface IPositionViewActionPopover {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
}
export const PositionViewActionPopover: React.FC<IPositionViewActionPopover> = ({
  anchorEl,
  open,
  handleClose
}) => {
  const { classes } = useStyles()
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{ paper: classes.paper }}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid className={classes.root}>
        <Grid className={classes.list} container alignContent='space-around' direction='column'>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Claim fee</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Lock position</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Manage Liquidity</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Remove position</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  )
}
export default PositionViewActionPopover
