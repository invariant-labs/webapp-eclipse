import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'
import { useStyles } from './style'

interface IProps {
  icon: string
  title: string
  isDisabled?: boolean
  onClick?: () => void
  minWidth?: number
  style?: React.CSSProperties
  smallerIcon?: boolean
}

const BoxValue: React.FC<IProps> = ({
  title,
  icon,
  onClick,
  minWidth,
  style,
  isDisabled,
  smallerIcon
}) => {
  const { classes, cx } = useStyles()
  return (
    <Grid
      className={cx(classes.container, { [classes.disabled]: isDisabled })}
      flex={1}
      onClick={e => {
        e.stopPropagation()
        onClick?.()
      }}>
      <img
        src={icon}
        alt={title}
        style={{ width: smallerIcon ? 12 : 20, height: smallerIcon ? 12 : 20 }}
      />
      <Typography color={colors.invariant.text}>{title}</Typography>
    </Grid>
  )
}

export default BoxValue
