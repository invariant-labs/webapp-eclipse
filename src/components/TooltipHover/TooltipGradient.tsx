import { useState } from 'react'
import { Tooltip, TooltipProps, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'
import { theme } from '@static/theme'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  underline?: boolean
}

export const TooltipGradient = ({ top, children, underline, ...props }: Props) => {
  const { classes } = useStyles({ top })
  const [open, setOpen] = useState(false)

  const isSm = useMediaQuery(theme.breakpoints.down('md'))

  const handleClick = () => {
    if (isSm) {
      setOpen(prev => !prev)
    }
  }

  const handleClose = () => {
    if (isSm) {
      setOpen(false)
    }
  }

  return (
    <Tooltip
      classes={{ tooltip: classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      PopperProps={{
        disablePortal: true
      }}
      open={open}
      onClose={handleClose}
      {...props}>
      <span
        onClick={handleClick}
        style={{ cursor: 'pointer', textDecoration: underline ? 'underline' : '' }}>
        {children}
      </span>
    </Tooltip>
  )
}
