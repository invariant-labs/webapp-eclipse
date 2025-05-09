import Overlay from '@static/png/presale/Overlay.png'
import { Box } from '@mui/material'
export const OverlayWrapper = () => {
    return (
        <Box sx={{ position: 'absolute', pointerEvents: 'none', top: '18%', transform: 'translate(-50%,-50%)', left: '35%', zIndex: 1 }}>
            <img src={Overlay} alt="Invariant Logo" style={{ width: '50%', height: '50%' }} />
        </Box>
    )
}
