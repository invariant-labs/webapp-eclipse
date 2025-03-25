import { Theme } from '@emotion/react'
import { SxProps } from '@mui/material'
import { Direction, Shape } from '../types/types'
import { createArrowStyle } from './createArrowConnectorStyle'

const LINE_LENGTH = 24
const LINE_COLOR = 'rgba(255, 255, 255, 0.2)'

type ConnectorStyles = {
  container: SxProps<Theme>
  line?: SxProps<Theme>
  line1?: SxProps<Theme>
  line2?: SxProps<Theme>
  arrow?: SxProps<Theme>
}

type ConnectorStyleProps = {
  longerConnector: boolean
  shape: Shape
  direction: Direction
  withArrow: boolean
}

const getPositionAdjustment = (shape: Shape) => {
  return shape === 'circle' ? { x: 0, y: -0.3 } : { x: 0, y: 0.3 }
}

export const getConnectorStyles = ({
  direction,
  longerConnector,
  shape,
  withArrow
}: ConnectorStyleProps): ConnectorStyles => {
  const adjustment = getPositionAdjustment(shape)

  const downLength = longerConnector ? LINE_LENGTH + 85 : LINE_LENGTH + 6
  const upLength = longerConnector ? LINE_LENGTH + 52 : LINE_LENGTH

  switch (direction) {
    case 'right':
      return {
        container: {
          position: 'absolute',
          right: -LINE_LENGTH,
          top: '50%',
          transform: `translateY(calc(-50% + ${adjustment.y}px))`,
          height: '1px',
          display: 'flex',
          alignItems: 'center'
        },
        line: {
          width: LINE_LENGTH,
          height: '0.5px',
          backgroundColor: LINE_COLOR
        },
        arrow: withArrow ? createArrowStyle('right', LINE_COLOR) : undefined
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
        arrow: withArrow ? createArrowStyle('left', LINE_COLOR) : undefined
      }

    case 'down':
      return {
        container: {
          position: 'absolute',
          bottom: longerConnector ? -LINE_LENGTH - 88 : -LINE_LENGTH - 10,
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
        arrow: withArrow ? createArrowStyle('down', LINE_COLOR) : undefined
      }

    case 'up':
      return {
        container: {
          position: 'absolute',
          top: longerConnector ? -LINE_LENGTH - 52 : -LINE_LENGTH,
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
        arrow: withArrow ? createArrowStyle('up', LINE_COLOR) : undefined
      }

    default:
      return { container: {} }
  }
}
