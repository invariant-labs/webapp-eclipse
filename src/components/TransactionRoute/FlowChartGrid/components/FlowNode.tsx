import { Box, Typography } from '@mui/material'
import { NodeConnector } from './NodeConnector'
import { typography, colors } from '@static/theme'
import LifinityLogo from '@static/png/InvariantAggregator/lifinity.png'
import { Height } from '@mui/icons-material'
import icons from '@static/icons'
export const FlowNode = ({
  shape,
  label,
  textA,
  dexInfo,
  textB,
  bigNode = false,
  connectors,
  logoImg,
  labelPos = 'bottom'
}) => {
  const circleSize = bigNode ? 36 : 27
  const rectWidth = 82
  const rectHeight = 40

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
          border: '1px solid #A9B6BF',
          gap: '6px',
          backgroundImage: shape === 'circle' ? `url(${logoImg})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        {label && (
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
                maxWidth: '13px',
                maxHeight: '18px'
              }}
            />
            <Box>
              <Typography
                sx={{
                  ...typography.caption4
                }}>
                {dexInfo.fee}%
              </Typography>
              <a href={dexInfo.link} target='_blank'>
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
            withArrow={connector.withArrow}
            shape={shape}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: '5px',
          textAlign: 'center',
          position: 'absolute',
          ...(labelPos === 'right' ? { top: '25%', left: bigNode ? '30px' : '20px' } : {}),
          ...(labelPos === 'bottom' ? { top: bigNode ? '80%' : '70%' } : {})
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
          {textB ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}
