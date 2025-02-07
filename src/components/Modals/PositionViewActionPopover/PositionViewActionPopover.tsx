import React from 'react'
import classNames from 'classnames'
import useStyles from './style'
import { Grid, Popover, Typography } from '@mui/material'
import { actions } from '@store/reducers/positions'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { actions as lockerActions } from '@store/reducers/locker'
import { network } from '@store/selectors/solanaConnection'

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
  const navigate = useNavigate()
  const currentNetwork = useSelector(network)

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
          <Grid
            className={classNames(classes.listItem)}
            item
            onClick={e => {
              e.stopPropagation()
              dispatch(
                actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked })
              )
              handleClose()
            }}>
            <Typography className={classes.name}>Claim fee</Typography>
          </Grid>
          <Grid
            className={classNames(classes.listItem)}
            item
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
          </Grid>
        </Grid>
        <Grid
          className={classNames(classes.listItem)}
          item
          onClick={e => {
            e.stopPropagation()
            dispatch(
              lockerActions.lockPosition({ index: position.positionIndex, network: currentNetwork })
            )
            handleClose()
          }}>
          <Typography className={classes.name}>Lock position</Typography>
        </Grid>
      </Grid>
    </Popover>
  )
}

export default PositionViewActionPopover
