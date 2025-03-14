import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { NodeConnectorProps } from '../types/types'

export const NodeConnector: React.FC<NodeConnectorProps> = ({
  direction = 'right',
  withArrow = false,
  shape,
  longerConnector = false
}) => {
  const lineLength = 24
  const arrowSize = 5

  const getConnectorPositionAdjustment = () => {
    if (shape === 'circle') return { x: 0, y: 0 }

    return { x: 0, y: 0 }
  }

  const adjustment = getConnectorPositionAdjustment()

  const getConnectorStyles = () => {
    switch (direction) {
      case 'right':
        return {
          container: {
            position: 'absolute',
            right: -lineLength,
            top: '50%',
            transform: `translateY(calc(-50% + ${adjustment.y}px))`,
            height: '1px',
            display: 'flex',
            alignItems: 'center'
          } as SxProps<Theme>,
          line: {
            width: lineLength,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderLeft: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginLeft: '-1px'
              } as SxProps<Theme>)
            : undefined
        }
      case 'left':
        return {
          container: {
            position: 'absolute',
            left: -lineLength + 8,
            top: '50%',
            transform: `translateY(calc(-50% + ${adjustment.y}px))`,
            height: '1px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse'
          } as SxProps<Theme>,
          line: {
            width: lineLength - 12,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginRight: '-1px'
              } as SxProps<Theme>)
            : undefined
        }
      case 'down':
        return {
          container: {
            position: 'absolute',
            bottom: longerConnector ? -lineLength - 85 : -lineLength - 10,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          } as SxProps<Theme>,
          line: {
            height: longerConnector ? lineLength + 80 : lineLength + 6,
            width: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginTop: '-1px'
              } as SxProps<Theme>)
            : undefined
        }
      case 'up':
        return {
          container: {
            position: 'absolute',
            top: longerConnector ? -lineLength - 60 : -lineLength,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center'
          } as SxProps<Theme>,
          line: {
            height: longerConnector ? lineLength + 60 : lineLength,
            width: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginBottom: '-1px'
              } as SxProps<Theme>)
            : undefined
        }
      case 'right-down':
        return {
          container: {
            position: 'absolute',
            right: -lineLength / 2,
            bottom: -lineLength / 2,
            width: lineLength,
            height: lineLength
          } as SxProps<Theme>,
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          line2: {
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 1.5,
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                transform: 'translateX(-50%)'
              } as SxProps<Theme>)
            : undefined
        }
      case 'down-right':
        return {
          container: {
            position: 'absolute',
            bottom: -lineLength / 2,
            right: -lineLength / 2,
            width: lineLength,
            height: lineLength
          } as SxProps<Theme>,
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1.5,
            height: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          line2: {
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          } as SxProps<Theme>,
          arrow: withArrow
            ? ({
                position: 'absolute',
                right: 0,
                top: '50%',
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderLeft: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                transform: 'translateY(-50%)'
              } as SxProps<Theme>)
            : undefined
        }
      default:
        return {}
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
