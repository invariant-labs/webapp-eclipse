import { Box, Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import { theme } from '@static/theme'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'

type Aligment = 'left' | 'center' | 'right'

interface IProgressItemProps {
  background: {
    mobile: string
    desktop: string
  }
  desktopLabelAligment: Aligment
  isWideBlock?: boolean
  label: string
  blockHeight?: {
    mobile?: string
    desktop?: string
  }
  value: string | number
  tooltip?: string
  isLoading?: boolean
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  background,
  label,
  value,
  desktopLabelAligment,
  isWideBlock = false,
  tooltip,
  isLoading = false
}) => {
  const { classes } = useStyles()

  const getAlignmentValue = (align: Aligment): string => {
    const alignments = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    }

    return alignments[align]
  }

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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        width: '250px',
        height: '94px',
        backgroundSize: 'cover',
        backgroundImage: `url(${background.desktop})`,
        boxSizing: 'border-box',
        backgroundPosition: 'center',
        ...blurAnimation,
        [theme.breakpoints.down('md')]: {
          width: '335px',
          backgroundImage: `url(${background.mobile})`,
          height: isWideBlock ? '90px' : '88px'
        },
        [theme.breakpoints.down(500)]: {
          backgroundRepeat: 'no-repeat',
          width: '98vw',
          border: '10px solid transparent',
          borderImage: `url(${background.mobile}) 20 fill round`
        }
      }}>
      <Box
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingLeft: !isMobile ? (desktopLabelAligment === 'left' ? '14px' : '24px') : '24px',
          paddingRight: !isMobile ? (desktopLabelAligment === 'right' ? '14px' : '24px') : '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: getAlignmentValue(desktopLabelAligment),
          justifyContent: 'flex-start',
          [theme.breakpoints.down('md')]: {
            alignItems: 'center',
            justifyContent: 'center'
          }
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
            <TooltipGradient title={tooltip} placement='bottom' top={1}>
              <img src={infoIcon} alt='i' width={14} />
            </TooltipGradient>
          ) : null}
        </Box>
        {isLoading ? (
          <div className={classes.blur} />
        ) : (
          <Typography className={classes.headerBigText}>{value}</Typography>
        )}
      </Box>
    </Box>
  )
}
