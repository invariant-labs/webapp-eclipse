import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'
import { useStyles } from './style'

interface IProps {
  title: string
  value: string | number | JSX.Element
  minWidth?: number
  style?: React.CSSProperties
}

const ItemValue: React.FC<IProps> = ({ title, value, minWidth, style }) => {
  const { classes } = useStyles()
  return (
    <Grid flexBasis={minWidth} flexShrink={0.2} style={style} className={classes.container}>
      <Typography
        sx={{ ...typography.body2 }}
        color={colors.invariant.textGrey}
        className={classes.title}>
        {title}
      </Typography>
      <Box className={classes.value}>{value}</Box>
    </Grid>
  )
}

export default ItemValue
