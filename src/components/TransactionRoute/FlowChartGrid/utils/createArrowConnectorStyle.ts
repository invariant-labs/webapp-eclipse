import { Theme } from '@emotion/react'
import { SxProps } from '@mui/material'

const ARROW_SIZE = 5

export const createArrowStyle = (
  arrowDirection: 'left' | 'right' | 'up' | 'down',
  lineColor: string
): SxProps<Theme> => {
  const baseStyle = {
    width: 0,
    height: 0
  } as SxProps<Theme>

  switch (arrowDirection) {
    case 'left':
      return {
        ...baseStyle,
        borderTop: `${ARROW_SIZE}px solid transparent`,
        borderBottom: `${ARROW_SIZE}px solid transparent`,
        borderRight: `${ARROW_SIZE}px solid ${lineColor}`,
        marginRight: '-1px'
      }
    case 'right':
      return {
        ...baseStyle,
        borderTop: `${ARROW_SIZE}px solid transparent`,
        borderBottom: `${ARROW_SIZE}px solid transparent`,
        borderLeft: `${ARROW_SIZE}px solid ${lineColor}`,
        marginLeft: '-1px'
      }
    case 'up':
      return {
        ...baseStyle,
        borderLeft: `${ARROW_SIZE}px solid transparent`,
        borderRight: `${ARROW_SIZE}px solid transparent`,
        borderBottom: `${ARROW_SIZE}px solid ${lineColor}`,
        marginBottom: '-1px'
      }
    case 'down':
      return {
        ...baseStyle,
        borderLeft: `${ARROW_SIZE}px solid transparent`,
        borderRight: `${ARROW_SIZE}px solid transparent`,
        borderTop: `${ARROW_SIZE}px solid ${lineColor}`,
        marginTop: '-1px'
      }
    default:
      return baseStyle
  }
}
