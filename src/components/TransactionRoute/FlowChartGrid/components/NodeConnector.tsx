import { Box } from '@mui/material'

export const NodeConnector = ({ direction = 'right', withArrow = false, shape }) => {
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
          },
          line: {
            width: lineLength,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderLeft: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginLeft: '-1px'
              }
            : null
        }
      case 'left':
        return {
          container: {
            position: 'absolute',
            left: -lineLength + 5,
            top: '50%',
            transform: `translateY(calc(-50% + ${adjustment.y}px))`,
            height: '1px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse'
          },
          line: {
            width: lineLength - 9,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginRight: '-1px'
              }
            : null
        }
      case 'down':
        return {
          container: {
            position: 'absolute',
            bottom: -lineLength,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          },
          line: {
            height: lineLength,
            width: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginTop: '-1px'
              }
            : null
        }
      case 'up':
        return {
          container: {
            position: 'absolute',
            top: -lineLength,
            left: '50%',
            transform: `translateX(calc(-50% + ${adjustment.x}px))`,
            width: 1.5,
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center'
          },
          line: {
            height: lineLength,
            width: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                marginBottom: '-1px'
              }
            : null
        }
      case 'right-down':
        return {
          container: {
            position: 'absolute',
            right: -lineLength / 2,
            bottom: -lineLength / 2,
            width: lineLength,
            height: lineLength
          },
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          line2: {
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 1.5,
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: 0,
                height: 0,
                borderLeft: `${arrowSize}px solid transparent`,
                borderRight: `${arrowSize}px solid transparent`,
                borderTop: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                transform: 'translateX(-50%)'
              }
            : null
        }
      case 'down-right':
        return {
          container: {
            position: 'absolute',
            bottom: -lineLength / 2,
            right: -lineLength / 2,
            width: lineLength,
            height: lineLength
          },
          line1: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1.5,
            height: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          line2: {
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          },
          arrow: withArrow
            ? {
                position: 'absolute',
                right: 0,
                top: '50%',
                width: 0,
                height: 0,
                borderTop: `${arrowSize}px solid transparent`,
                borderBottom: `${arrowSize}px solid transparent`,
                borderLeft: `${arrowSize}px solid rgba(255, 255, 255, 0.2)`,
                transform: 'translateY(-50%)'
              }
            : null
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
