import { Box, Tooltip, Typography } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import { theme } from '@static/theme'

interface IProgressItemProps {
  background: {
    mobile: string
    dekstop: string
  }
  desktopLabelAligment: 'left' | 'right'
  label: string
  value: string | number
  tooltip?: string
}

export const ProgressItem: React.FC<IProgressItemProps> = ({
  background,
  label,
  value,
  desktopLabelAligment,
  tooltip
}) => {
  const { classes } = useStyles()

  return (
    <Box
      sx={{
        width: '233px',
        height: '88px',
        [theme.breakpoints.down('md')]: {
          width: '335px',
          backgroundImage: `url(${background.mobile})`
        },
        backgroundImage: `url(${background.dekstop})`,
        backgroundSize: 'cover',
        boxSizing: 'border-box',
        backgroundPosition: 'center'
      }}>
      <Box
        sx={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingLeft: '24px',
          paddingRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: desktopLabelAligment === 'right' ? 'flex-end' : 'flex-start',
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
            <Tooltip
              title={tooltip}
              placement='bottom'
              classes={{
                tooltip: classes.tooltip
              }}>
              <img src={infoIcon} alt='i' width={14} />
            </Tooltip>
          ) : null}
        </Box>
        <Typography className={classes.headerBigText}>{value}</Typography>
      </Box>
    </Box>
  )
}
