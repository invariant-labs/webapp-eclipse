import Overlay from '@static/png/presale/Overlay.png'
import { Box, useMediaQuery } from '@mui/material'
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
        <Box
            sx={{
                position: 'absolute',
                pointerEvents: 'none',
                top: '18%',
                transform: 'translate(-50%,-50%)',
                left: `${calculateLeftPosition()}%`,
                zIndex: 1
            }}
        >
            <img src={Overlay} alt="Invariant Logo" style={{ width: '50%', height: '50%' }} />
        </Box>
    );
}