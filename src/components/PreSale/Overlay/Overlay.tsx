import Overlay from '@static/png/presale/Overlay.png'
import PageOverlay from '@static/png/presale/page_overlay.png'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'

export const OverlayWrapper = () => {
    const [zoomLevel, setZoomLevel] = useState(100);

    const calculateLeftPosition = () => {
        return 47 - ((zoomLevel - 25) / 75) * 10;
    };

    useEffect(() => {
        updateZoomLevel();

        window.addEventListener('resize', updateZoomLevel);

        return () => {
            window.removeEventListener('resize', updateZoomLevel);
        };
    }, []);

    const updateZoomLevel = () => {
        const currentZoom = Math.round(window.devicePixelRatio * 100);
        setZoomLevel(currentZoom);
    };

    return (
        <>
            <Box
                sx={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    top: '13%',
                    transform: 'translate(-50%,-50%)',
                    left: `${calculateLeftPosition()}%`,
                    zIndex: 1,
                    'md': { display: 'block' }, 'sm': { display: 'none' }
                }}
            >
                <img src={Overlay} alt="Invariant Logo" style={{ width: '50%', height: '50%' }} />
            </Box>
            <Box
                sx={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    top: '60%',
                    transform: 'translate(-50%,-50%)',
                    left: `50%`,
                    zIndex: 1,
                    opacity: 0.5,
                    'sm': { display: 'block' }, 'md': { display: 'none' }
                }}>
                <img src={PageOverlay} alt="Invariant Logo" style={{ width: '100vw', height: '100%' }} />
            </Box>
        </>
    );
}