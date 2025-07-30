import { Box } from '@mui/material'
import Overlay1 from '@static/png/presale/overlay1.png'
import Overlay2 from '@static/png/presale/overlay2.png'
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
          top: 550,
          left: 'calc(50% - 600px)',
          width: '230px',
          height: '240px',
          zIndex: 10,
          backgroundImage: `url(${Overlay1})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.5
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '-100px',
          left: 'calc(50% - 300px)',
          width: '120px',
          height: '200px',
          overflow: 'visible',
          zIndex: 10,
          backgroundImage: `url(${Overlay2})`,
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
