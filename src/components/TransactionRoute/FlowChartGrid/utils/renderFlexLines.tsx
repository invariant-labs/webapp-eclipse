import { Box } from '@mui/material'
import { CornerPosition } from '../types/types'

export const renderFlexLines = (cornerPosition?: CornerPosition) => {
  const baseLineStyle = {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 11
  }

  switch (cornerPosition) {
    case CornerPosition.BottomLeft:
      return (
        <>
          <Box
            sx={{
              ...baseLineStyle,
              width: `50%`,
              height: '0.5px',
              top: '49%',
              left: '0%'
            }}
          />
          <Box
            sx={{
              ...baseLineStyle,
              width: '0.5px',
              height: `57%`,
              top: '51%',
              left: '49.5%'
            }}
          />
        </>
      )
    case CornerPosition.TopLeft:
      return (
        <>
          <Box
            sx={{
              ...baseLineStyle,
              width: `50%`,
              height: '0.5px',
              top: '50%',
              left: '0%'
            }}
          />
          <Box
            sx={{
              ...baseLineStyle,
              width: '0.5px',
              height: `52%`,
              top: '-2%',
              left: '49.5%'
            }}
          />
        </>
      )
    case CornerPosition.TopRight:
      return (
        <>
          <Box
            sx={{
              ...baseLineStyle,
              width: `50%`,
              height: '0.5px',
              top: '50%',
              left: '50%'
            }}
          />
          <Box
            sx={{
              ...baseLineStyle,
              width: '1px',
              height: `50%`,
              top: '0%',
              left: '50%'
            }}
          />
        </>
      )
    case CornerPosition.BottomRight:
      return (
        <>
          <Box
            sx={{
              ...baseLineStyle,
              width: `50%`,
              height: '0.5px',
              top: '50%',
              left: '50%'
            }}
          />
          <Box
            sx={{
              ...baseLineStyle,
              width: '1px',
              height: `50%`,
              top: '50%',
              left: '50%'
            }}
          />
        </>
      )
  }
}
