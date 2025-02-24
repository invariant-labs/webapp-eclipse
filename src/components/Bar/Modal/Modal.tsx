import { blurContent, unblurContent } from '@utils/uiUtils'
import { useRef, useState } from 'react'
import { BarButton } from '../BarButton/BarButton'
import { useStyles } from './style'
import { Box, Popover, Typography } from '@mui/material'
import icons from '@static/icons'

type Props = {
  icon: React.ReactNode
  title?: string
  showTitle?: boolean
  children?: React.ReactNode
}

export const Modal = ({ icon, title, showTitle, children }: Props) => {
  const { classes } = useStyles()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const handleOpen = () => {
    setOpen(true)
    blurContent()
  }

  const handleClose = () => {
    setOpen(false)
    unblurContent()
  }

  return (
    <>
      <BarButton ref={ref} onClick={() => handleOpen()} showArrowDown={true}>
        {icon}
      </BarButton>
      <Popover
        classes={{ paper: classes.popover }}
        open={open}
        anchorEl={ref.current}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}>
        <Box className={classes.popoverContainer}>
          {showTitle && (
            <Box className={classes.popoverHeader}>
              <Typography className={classes.title}>{title}</Typography>
              <img
                className={classes.closeIcon}
                src={icons.closeSmallIcon}
                alt='Close icon'
                onClick={() => handleClose()}
              />
            </Box>
          )}
          {children}
        </Box>
      </Popover>
    </>
  )
}
