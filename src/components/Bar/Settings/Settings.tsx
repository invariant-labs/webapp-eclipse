import { useStyles } from './style'
import icons from '@static/icons'
import { BarButton } from '../BarButton/BarButton'
import { Box, Popover, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Switch } from '@components/Switch/Switch'

export const Settings = () => {
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
      <BarButton ref={ref} onClick={() => handleOpen()}>
        <img className={classes.barButtonIcon} src={icons.settings2} alt='Settings icon' />
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
          <Box className={classes.popoverHeader}>
            <Typography className={classes.title}>Settings</Typography>
            <img
              className={classes.closeIcon}
              src={icons.closeSmallIcon}
              alt='Close icon'
              onClick={() => handleClose()}
            />
          </Box>
          <Switch items={['RPC', 'Priority Fee']} />
        </Box>
      </Popover>
    </>
  )
}
