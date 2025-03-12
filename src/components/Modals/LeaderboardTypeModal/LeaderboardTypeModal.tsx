import React from 'react'
import useStyles from './style'
import { Button, Grid, Popover } from '@mui/material'
import { LeaderBoardType } from '@store/consts/static'

export interface ISelectNetworkModal {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
  selectOption: (option: LeaderBoardType) => void
  options: LeaderBoardType[]
  currentOption: LeaderBoardType
}

export const LeaderboardTypeModal: React.FC<ISelectNetworkModal> = ({
  anchorEl,
  open,
  handleClose,
  selectOption,
  options,
  currentOption
}) => {
  const { classes } = useStyles()
  const handleSave = (opt: LeaderBoardType) => {
    selectOption(opt)
    handleClose()
  }
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
        {options
          .filter(item => item !== currentOption)
          .map(opt => (
            <Button
              key={opt}
              onClick={() => handleSave(opt)}
              className={classes.optionButton}
              disableRipple>
              {opt}
            </Button>
          ))}
      </Grid>
    </Popover>
  )
}

export default LeaderboardTypeModal
