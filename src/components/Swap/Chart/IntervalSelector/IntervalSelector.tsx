import React, { useState } from 'react'
import { Box, Button, Popover, Grid, Typography } from '@mui/material'
import useStyles from './style'
import { CandleIntervals } from '@store/consts/static'
import { DropdownIcon } from '@static/componentIcon/DropdownIcon'

export interface IProps {
  value: CandleIntervals
  onChange: (interval: CandleIntervals) => void
}

export const IntervalSelector: React.FC<IProps> = ({ value, onChange }) => {
  const { classes, cx } = useStyles()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleSelect = (interval: CandleIntervals) => {
    onChange(interval)
    handleClose()
  }

  return (
    <Box display='flex' mt='auto'>
      <Button
        onClick={handleClick}
        className={classes.selected}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Typography className={classes.selectedText}>{value}</Typography>
        <DropdownIcon style={{ marginLeft: 4, transform: open ? 'scaleY(-1)' : 'none' }} />
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        classes={{ paper: classes.paper }}>
        <Grid className={classes.root}>
          {Object.values(CandleIntervals).map(interval => (
            <Box
              key={interval}
              className={cx(classes.option, {
                [classes.active]: value === interval
              })}
              onClick={e => {
                e.stopPropagation()
                handleSelect(interval)
              }}>
              <Typography className={classes.optionText}>{interval}</Typography>
            </Box>
          ))}
        </Grid>
      </Popover>
    </Box>
  )
}
