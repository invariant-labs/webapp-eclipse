import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { NodeConnectorProps } from '../types/types'

// Constants
const LINE_LENGTH = 24
const ARROW_SIZE = 5
const LINE_COLOR = 'rgba(255, 255, 255, 0.2)'

// Types
type ConnectorStyles = {
  container: SxProps<Theme>
  line?: SxProps<Theme>
  line1?: SxProps<Theme>
  line2?: SxProps<Theme>
  arrow?: SxProps<Theme>
}

export const NodeConnector: React.FC<NodeConnectorProps> = ({
  direction = 'right',
  withArrow = false,
  shape,
  longerConnector = false
}) => {
  const getPositionAdjustment = () => {
    return shape === 'circle' ? { x: 0, y: 0.3 } : { x: -0, y: 0.3 }
  }

  const createArrowStyle = (arrowDirection: 'left' | 'right' | 'up' | 'down'): SxProps<Theme> => {
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
          borderRight: `${ARROW_SIZE}px solid ${LINE_COLOR}`,
          marginRight: '-1px'
        }
      case 'right':
        return {
          ...baseStyle,
          borderTop: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid transparent`,
          borderLeft: `${ARROW_SIZE}px solid ${LINE_COLOR}`,
          marginLeft: '-1px'
        }
      case 'up':
        return {
          ...baseStyle,
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderBottom: `${ARROW_SIZE}px solid ${LINE_COLOR}`,
          marginBottom: '-1px'
        }
      case 'down':
        return {
          ...baseStyle,
          borderLeft: `${ARROW_SIZE}px solid transparent`,
          borderRight: `${ARROW_SIZE}px solid transparent`,
          borderTop: `${ARROW_SIZE}px solid ${LINE_COLOR}`,
          marginTop: '-1px'
        }
      default:
        return baseStyle
    }
  }

  const getConnectorStyles = (): ConnectorStyles => {
    const adjustment = getPositionAdjustment()

    const downLength = longerConnector ? LINE_LENGTH + 80 : LINE_LENGTH + 6
    const upLength = longerConnector ? LINE_LENGTH + 60 : LINE_LENGTH

    switch (direction) {
      case 'right':
        return {
          container: {
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: `translateY(calc(-50% + ${adjustment.y}px))`,
            display: 'flex',
            alignItems: 'center'
          },
          line: {
            width: '100px',
            height: '0.5px',
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow ? createArrowStyle('right') : undefined
        }

      case 'left':
        return {
          container: {
            position: 'absolute',
            left: -LINE_LENGTH + 8,
            top: '50%',
            transform: `translateY(calc(-50% + ${adjustment.y}px))`,
            height: '0.5px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse'
          },
          line: {
            width: LINE_LENGTH - 12,
            height: '1px',
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow ? createArrowStyle('left') : undefined
        }

      case 'down':
        return {
          container: {
            position: 'absolute',
            bottom: longerConnector ? -LINE_LENGTH - 85 : -LINE_LENGTH - 10,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          },
          line: {
            height: downLength,
            width: 1.5,
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow ? createArrowStyle('down') : undefined
        }

      case 'up':
        return {
          container: {
            position: 'absolute',
            top: longerConnector ? -LINE_LENGTH - 60 : -LINE_LENGTH,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center'
          },
          line: {
            height: upLength,
            width: 1.5,
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow ? createArrowStyle('up') : undefined
        }

      case 'right-down':
        return {
          container: {
            position: 'absolute',
            right: -LINE_LENGTH / 2,
            bottom: -LINE_LENGTH / 2,
            width: LINE_LENGTH,
            height: LINE_LENGTH
          },
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: 1,
            backgroundColor: LINE_COLOR
          },
          line2: {
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 1.5,
            height: '100%',
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow
            ? {
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                ...createArrowStyle('down')
              }
            : undefined
        }

      case 'down-right':
        return {
          container: {
            position: 'absolute',
            bottom: -LINE_LENGTH / 2,
            right: -LINE_LENGTH / 2,
            width: LINE_LENGTH,
            height: LINE_LENGTH
          },
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1.5,
            height: '50%',
            backgroundColor: LINE_COLOR
          },
          line2: {
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: 1,
            backgroundColor: LINE_COLOR
          },
          arrow: withArrow
            ? {
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                ...createArrowStyle('right')
              }
            : undefined
        }

      default:
        return { container: {} }
    }
  }

  const styles = getConnectorStyles()

  if (!styles.container) return null

  return (
    <Box sx={styles.container}>
      {styles.line && <Box sx={styles.line} />}
      {styles.line1 && <Box sx={styles.line1} />}
      {styles.line2 && <Box sx={styles.line2} />}
      {styles.arrow && <Box sx={styles.arrow} />}
    </Box>
  )
}
