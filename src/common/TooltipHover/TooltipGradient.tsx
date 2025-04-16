import React, { useEffect, useState } from 'react'
import { Box, Tooltip, TooltipProps, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { TooltipTransition } from './TooltipTransition/TooltipTransition'
import { theme } from '@static/theme'

interface Props extends TooltipProps {
  top?: number
  children: React.ReactElement<any, any>
  title: React.ReactNode
  noGradient?: boolean
  allowEnterTooltip?: boolean
}

export const TooltipGradient = ({
  top,
  children,
  noGradient,
  title,
  allowEnterTooltip = true,
  leaveDelay = 100,
  ...props
}: Props) => {
  const { classes } = useStyles({ top })
  const [open, setOpen] = useState(false)
  const [childrenHover, setChildrenHover] = useState(false)
  const [titleHover, setTitleHover] = useState(false)
  const [callback, setCallback] = useState<NodeJS.Timeout | null>(null)
  const isClosingOnScroll = useMediaQuery(theme.breakpoints.down(1200))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  // Handle scroll close
  useEffect(() => {
    const handleScroll = () => {
      setOpen(false)
      setChildrenHover(false)
      setTitleHover(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isClosingOnScroll])

  useEffect(() => {
    if (titleHover || childrenHover) {
      if (callback) clearTimeout(callback)
      setOpen(true)
    } else {
      const timeout = setTimeout(() => {
        setOpen(false)
        console.log('close')
      }, leaveDelay)
      setCallback(timeout)
    }

    return () => {
      if (callback) clearTimeout(callback)
    }
  }, [titleHover, childrenHover, leaveDelay])
  console.log(open)

  useEffect(() => {
    if (isMd && open) {
      if (callback) clearTimeout(callback)
      const timeout = setTimeout(() => {
        setOpen(false)
        console.log('close')
      }, 2000)
      setCallback(timeout)
    }

    return () => {
      if (callback) clearTimeout(callback)
    }
  }, [open, isMd])

  return (
    <Tooltip
      classes={{ tooltip: noGradient ? classes.tooltipNoGradient : classes.tooltipGradient }}
      placement='bottom'
      TransitionComponent={TooltipTransition}
      enterTouchDelay={0}
      leaveTouchDelay={Number.MAX_SAFE_INTEGER}
      leaveDelay={leaveDelay}
      open={open}
      title={
        <Box
          onMouseEnter={allowEnterTooltip ? () => setTitleHover(true) : undefined}
          onMouseLeave={allowEnterTooltip ? () => setTitleHover(false) : undefined}>
          {title}
        </Box>
      }
      {...props}>
      {React.cloneElement(children, {
        onMouseEnter: () => setChildrenHover(true),
        onMouseLeave: () => setChildrenHover(false),
        onFocus: () => setChildrenHover(true),
        onBlur: () => setChildrenHover(false),
        onClick: () => setOpen(true)
      })}
    </Tooltip>
  )
}
