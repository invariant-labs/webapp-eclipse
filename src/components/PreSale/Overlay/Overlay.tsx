import { Box } from '@mui/material'
import Overlay from '@static/png/presale/Overlay.png'
import PageOverlay from '@static/png/presale/page_overlay.png'

export const OverlayWrapper = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          left: 'calc(50% - 800px)',
          width: '900px',
          height: '800px',
          zIndex: 10,
          backgroundImage: `url(${Overlay})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5
        }}
      />

      <Box
        sx={{
          position: 'fixed',
          top: '20%',
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          backgroundImage: `url(${PageOverlay})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </Box>
  )
}

export default OverlayWrapper
