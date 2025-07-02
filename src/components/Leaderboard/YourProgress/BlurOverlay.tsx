import React from 'react'
import { Box } from '@mui/material'

interface IBlurOverlayProps {
  isConnected: boolean
}

export const BlurOverlay: React.FC<IBlurOverlayProps> = ({ isConnected }) => {
  return (
    <>
      {!isConnected ? (
        <Box
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            transform: 'translate(-50%,-50%)',
            top: '50%',
            left: '50%',
            zIndex: '2',
            padding: 4,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        />
      ) : null}
    </>
  )
}
