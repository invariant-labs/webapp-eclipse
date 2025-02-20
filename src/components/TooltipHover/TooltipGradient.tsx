import { Tooltip, TooltipProps } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  underline?: boolean
}

export const TooltipGradient = ({ top, children, underline, ...props }: Props) => {
  const { classes } = useStyles({ top })

  return (
    <Tooltip
      classes={{ tooltip: classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      enterTouchDelay={0}
      PopperProps={{
        disablePortal: true
      }}
      {...props}>
      <span style={{ cursor: 'pointer', textDecoration: underline ? 'underline' : '' }}>
        {children}
      </span>
    </Tooltip>
  )
}
