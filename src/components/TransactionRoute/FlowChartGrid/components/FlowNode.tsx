import React from 'react'
import { Box, Typography } from '@mui/material'
import { NodeConnector } from './NodeConnector'
import { typography, colors } from '@static/theme'
import icons from '@static/icons'
import { formatNumberWithSuffix } from '@utils/utils'
import { CornerPosition, FlowNodeProps } from '../types/types'

export const FlowNode: React.FC<FlowNodeProps> = ({
  shape,
  textA,
  dexInfo,
  textB,
  connectors,
  logoImg,
  cornerPosition,
  bigNode = false,
  labelPos = 'bottom'
}) => {
  const circleSize = bigNode ? 36 : 27
  const rectWidth = 90
  const rectHeight = 50

  const renderFlexLines = () => {
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
          border: cornerPosition ? 'none' : '1px solid #A9B6BF',
          gap: '6px',
          backgroundImage: shape === 'circle' && logoImg ? `url(${logoImg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        {shape !== 'circle' && renderFlexLines()}

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
