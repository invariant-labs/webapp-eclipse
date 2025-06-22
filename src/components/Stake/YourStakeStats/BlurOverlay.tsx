import React from 'react'
import { Box } from '@mui/material'
import useStyles from './styles'

interface IBlurOverlayProps {
  isConnected: boolean
}

export const BlurOverlay: React.FC<IBlurOverlayProps> = ({ isConnected }) => {
  const { classes } = useStyles({})
  return (
    <>
      {!isConnected ? (
        <Box
          className={classes.blurOverlay}
        />
      ) : null}
    </>
  )
}
