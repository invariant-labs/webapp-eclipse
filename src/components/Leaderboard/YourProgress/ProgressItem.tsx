import { Box, Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import { blurContent } from '@utils/uiUtils'

interface IProgressItemProps {
  onModalOpen?: (open: boolean) => void
  label: string
  blockHeight?: {
    mobile?: string
    desktop?: string
  }
  value: string | number
  tooltip?: React.ReactNode
  isLoading?: boolean
  withButton?: boolean
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  label,
  value,
  tooltip,
  withButton = false,
  isLoading = false,
  onModalOpen
}) => {
  const { classes } = useStyles()

  const blurAnimation = {
    '@keyframes pulseBlur': {
      '0%': {
        filter: 'blur(4px)',
        opacity: 0.7
      },
      '50%': {
        filter: 'blur(6px)',
        opacity: 0.5
      },
      '100%': {
        filter: 'blur(4px)',
        opacity: 0.7
      }
    }
  }

  return (
    <Box
      sx={{
        height: '94px',

        ...blurAnimation
      }}>
      <Box
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingLeft: '8px',
          paddingRight: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '8px'
          }}>
          <Typography className={classes.headerSmallText}>{label}</Typography>
          {tooltip ? (
            <Tooltip
              title={tooltip}
              placement='bottom'
              classes={{
                tooltip: classes.tooltip
              }}
              enterTouchDelay={0}>
              <img src={infoIcon} alt='i' width={14} />
            </Tooltip>
          ) : null}
        </Box>
        {isLoading ? (
          <div className={classes.blur} />
        ) : (
          <Box display='flex' alignItems='center' gap='8px'>
            <Typography className={classes.headerBigText}>{value}</Typography>
            {withButton && onModalOpen && (
              <Button
                className={classes.button}
                onClick={() => {
                  blurContent()
                  onModalOpen(true)
                }}>
                More
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
