import React from 'react'
import classNames from 'classnames'
import useStyles from './style'
import { Grid, Popover, Typography } from '@mui/material'
import { actions } from '@store/reducers/positions'
import { useDispatch, useSelector } from 'react-redux'
import { Position } from '@invariant-labs/sdk-eclipse/lib/market'
import { positionsWithPoolsData, singlePositionData } from '@store/selectors/positions'

export interface IPositionViewActionPopover {
  open: boolean
  anchorEl: HTMLButtonElement | null
  position?: any
  handleClose: () => void
}
export const PositionViewActionPopover: React.FC<IPositionViewActionPopover> = ({
  anchorEl,
  open,
  position,
  handleClose
}) => {
  const { classes } = useStyles()

  const dispatch = useDispatch()
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
          <Grid
            className={classNames(classes.listItem)}
            item
            onClick={() => {
              dispatch(
                actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked })
              )
            }}>
            <Typography className={classes.name}>Claim fee</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Lock position</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Manage Liquidity</Typography>
          </Grid>
          <Grid className={classNames(classes.listItem)} item onClick={() => {}}>
            <Typography className={classes.name}>Close position</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Popover>
  )
}
export default PositionViewActionPopover
