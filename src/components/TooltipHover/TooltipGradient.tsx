import { useState } from 'react'
import { Tooltip, TooltipProps } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'
import useIsMobile from '@store/hooks/isMobile'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  underline?: boolean
}

export const TooltipGradient = ({ top, children, underline, ...props }: Props) => {
  const { classes } = useStyles({ top })
  const [open, setOpen] = useState(false)

  const isMobile = useIsMobile()

  const handleClick = () => {
    if (isMobile) {
      setOpen(prev => !prev)
    }
  }

  const handleClose = () => {
    if (isMobile) {
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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
