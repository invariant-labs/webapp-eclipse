import { Tooltip, TooltipProps } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'
import { useState } from 'react'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  noGradient?: boolean
}

export const TooltipGradient = ({ top, children, noGradient, ...props }: Props) => {
  const { classes } = useStyles({ top })
  const [open, setOpen] = useState(false)

  return (
    <Tooltip
      classes={{ tooltip: noGradient ? classes.tooltipNoGradient : classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      enterTouchDelay={0}
      leaveTouchDelay={Number.MAX_SAFE_INTEGER}
      onTouchStart={() => setOpen(true)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      open={open}
      {...props}>
      {children}
    </Tooltip>
  )
}
