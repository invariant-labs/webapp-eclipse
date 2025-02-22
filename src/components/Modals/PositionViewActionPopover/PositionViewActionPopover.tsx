import React from 'react'
import classNames from 'classnames'
import useStyles from './style'
import { Button, Grid, Popover, Typography } from '@mui/material'
import { actions } from '@store/reducers/positions'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export interface IPositionViewActionPopover {
  open: boolean
  anchorEl: HTMLButtonElement | null
  position?: any
  unclaimedFeesInUSD: number
  handleClose: () => void
  onLockPosition: () => void
}

export const PositionViewActionPopover: React.FC<IPositionViewActionPopover> = ({
  anchorEl,
  open,
  position,
  handleClose,
  unclaimedFeesInUSD,
  onLockPosition
}) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{ paper: classes.paper }}
      onClose={handleClose}
      onClick={e => e.stopPropagation()}
      slotProps={{
        paper: {
          onClick: e => e.stopPropagation()
        }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid className={classes.root} onClick={e => e.stopPropagation()}>
        <Grid className={classes.list} container alignContent='space-around' direction='column'>
          <Button
            disabled={unclaimedFeesInUSD <= 0}
            className={classNames(classes.listItem)}
            onClick={e => {
              e.stopPropagation()
              dispatch(
                actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked })
              )
              handleClose()
            }}>
            <Typography className={classes.name}>Claim fee</Typography>
          </Button>
          <Button
            className={classNames(classes.listItem)}
            disabled={position.isLocked}
            onClick={e => {
              e.stopPropagation()
              dispatch(
                actions.closePosition({
                  positionIndex: position.positionIndex,
                  onSuccess: () => {
                    navigate('/portfolio')
                  }
                })
              )
              handleClose()
            }}>
            <Typography className={classes.name}>Close position</Typography>
          </Button>
        </Grid>
        <Button
          className={classNames(classes.listItem)}
          disabled={position.isLocked}
          onClick={e => {
            e.stopPropagation()
            onLockPosition()
            handleClose()
          }}>
          <Typography className={classes.name}>Lock position</Typography>
        </Button>
      </Grid>
    </Popover>
  )
}

export default PositionViewActionPopover
