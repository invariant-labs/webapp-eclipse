import { Tooltip, TooltipProps } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  noGradient?: boolean
}

export const TooltipGradient = ({ top, children, noGradient, ...props }: Props) => {
  const { classes } = useStyles({ top })

  return (
    <Tooltip
      classes={{ tooltip: noGradient ? classes.tooltipNoGradient : classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      enterTouchDelay={0}
      leaveTouchDelay={Number.MAX_SAFE_INTEGER}
      {...props}>
      {children}
    </Tooltip>
  )
}
