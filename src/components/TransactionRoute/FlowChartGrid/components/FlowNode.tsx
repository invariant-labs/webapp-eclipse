import React from 'react'
import { Box, Typography } from '@mui/material'
import { NodeConnector } from './NodeConnector'
import { typography, colors } from '@static/theme'
import icons from '@static/icons'
import { formatNumberWithSuffix } from '@utils/utils'
import { FlowNodeProps } from '../types/types'

export const FlowNode: React.FC<FlowNodeProps> = ({
  shape,
  textA,
  dexInfo,
  textB,
  bigNode = false,
  connectors,
  logoImg,
  labelPos = 'bottom',
  showTriangleArrow,
  arrowDirection = 'right' // New prop: 'right', 'left', 'up', or 'down'
}) => {
  const circleSize = bigNode ? 36 : 27
  const rectWidth = 90
  const rectHeight = 50

  // Define triangle arrow styles based on direction
  const getTriangleStyles = () => {
    switch (arrowDirection) {
      case 'right':
        return {
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: `12px solid ${colors.invariant.textGrey}`
        }
      case 'left':
        return {
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: `12px solid ${colors.invariant.textGrey}`
        }
      case 'up':
        return {
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: `12px solid ${colors.invariant.textGrey}`
        }
      case 'down':
        return {
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `12px solid ${colors.invariant.textGrey}`
        }
      default:
        return {
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: `12px solid ${colors.invariant.textGrey}`
        }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        position: 'relative'
      }}>
      <Box
        sx={{
          width: shape === 'circle' ? circleSize : rectWidth,
          height: shape === 'circle' ? circleSize : rectHeight,
          borderRadius: shape === 'circle' ? '50%' : '10px',
          display: 'flex',
          backgroundColor: colors.invariant.component,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: 10,
          border: shape === 'corner' ? 'none' : '1px solid #A9B6BF',
          gap: '6px',
          backgroundImage: shape === 'circle' && logoImg ? `url(${logoImg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        {showTriangleArrow && shape !== 'circle' && (
          <Box
            sx={{
              width: 0,
              height: 0,
              position: 'absolute',
              zIndex: 11,
              ...getTriangleStyles()
            }}
          />
        )}

        {dexInfo && (
          <Typography
            variant='body2'
            color='white'
            sx={{
              fontFamily: 'Mukta',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              letterSpacing: '-0.03em'
            }}>
            <img
              src={dexInfo.logo ?? ''}
              style={{
                marginRight: '8px',
                width: '100%',
                height: 'auto',
                maxWidth: '18px',
                maxHeight: '21px'
              }}
              alt={dexInfo.name}
            />
            <Box>
              <Typography
                sx={{
                  ...typography.caption3
                }}>
                {dexInfo.fee}%
              </Typography>
              <a href={dexInfo.link} target='_blank' rel='noopener noreferrer'>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography
                    sx={{
                      ...typography.caption4,
                      color: colors.invariant.textGrey,
                      textDecoration: 'underline'
                    }}>
                    {dexInfo.name}
                  </Typography>
                  <img
                    width={8}
                    height={8}
                    src={icons.newTab}
                    alt={'Exchange'}
                    style={{ marginLeft: '4px' }}
                  />
                </Box>
              </a>
            </Box>
          </Typography>
        )}

        {connectors.map((connector, index) => (
          <NodeConnector
            key={`connector-${index}`}
            direction={connector.direction}
            longerConnector={connector.longerConnector}
            withArrow={connector.withArrow}
            shape={shape}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: '5px',
          position: 'absolute',
          ...(labelPos === 'right' ? { top: '25%', left: bigNode ? '30px' : '20px' } : {}),
          ...(labelPos === 'bottom' ? { top: bigNode ? '80%' : '70%', textAlign: 'center' } : {})
        }}>
        <Typography
          sx={{
            color: colors.invariant.textGrey,
            ...typography.heading4,
            textWrap: 'nowrap'
          }}>
          {textA ?? ''}
        </Typography>
        <Typography sx={{ color: colors.invariant.text, ...typography.body2, textWrap: 'nowrap' }}>
          {(shape === 'circle' && textB && formatNumberWithSuffix(textB)) ?? ''} {textA ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}
