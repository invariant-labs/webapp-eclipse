import React from 'react'
import { Box, Typography } from '@mui/material'
import { NodeConnector } from '../NodeConnector/NodeConnector'
import { typography } from '@static/theme'
import icons from '@static/icons'
import { formatNumberWithSuffix } from '@utils/utils'
import { FlowNodeProps } from '../../types/types'
import { renderFlexLines } from '../../utils/renderFlexLines'
import { useStyles } from './style'

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
  const { classes } = useStyles()

  const CIRCLE_SIZE = bigNode ? 36 : 27
  const RECT_WIDTH = 90
  const RECT_HEIGHT = 50

  return (
    <Box className={classes.container}>
      <Box
        className={classes.nodeBase}
        sx={{
          width: shape === 'circle' ? CIRCLE_SIZE : RECT_WIDTH,
          height: shape === 'circle' ? CIRCLE_SIZE : RECT_HEIGHT,
          borderRadius: shape === 'circle' ? '50%' : '10px',
          border: cornerPosition ? 'none' : '1px solid #A9B6BF',
          backgroundImage: shape === 'circle' && logoImg ? `url(${logoImg})` : icons.unknownToken
        }}>
        {shape !== 'circle' && renderFlexLines(cornerPosition)}

        {dexInfo && (
          <Typography variant='body2' color='white' className={classes.dexInfoContainer}>
            <img src={dexInfo.logo ?? ''} className={classes.dexLogo} alt={dexInfo.name} />
            <Box>
              <Typography
                sx={{
                  ...typography.caption3
                }}>
                {dexInfo.fee}%
              </Typography>
              <a href={dexInfo.link} target='_blank' rel='noopener noreferrer'>
                <Box className={classes.dexLink}>
                  <Typography className={classes.dexLinkText}>{dexInfo.name}</Typography>
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
        className={classes.labelContainer}
        sx={{
          ...(labelPos === 'right' ? { top: '25%', left: bigNode ? '30px' : '20px' } : {}),
          ...(labelPos === 'bottom' ? { top: bigNode ? '80%' : '70%', textAlign: 'center' } : {})
        }}>
        <Typography className={classes.textA}>{textA ?? ''}</Typography>
        <Typography className={classes.textB}>
          {(shape === 'circle' && textB && formatNumberWithSuffix(textB)) ?? ''} {textA ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}
