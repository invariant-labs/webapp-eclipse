import { Tooltip, TooltipProps } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
}

export const TooltipGradient = ({ top, children, ...props }: Props) => {
  const { classes } = useStyles({ top })

  return (
    <Tooltip
      classes={{ tooltip: classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      {...props}>
      <span>{children}</span>
    </Tooltip>
  )
}
