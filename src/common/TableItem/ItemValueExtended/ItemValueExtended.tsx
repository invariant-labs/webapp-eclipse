import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { useStyles } from './style'

interface IProps {
  title: string | JSX.Element
  value: string | number | JSX.Element
  secondValue?: string | number | JSX.Element
  minWidth?: number
  style?: React.CSSProperties
  valueColor?: string
}

const ItemValueExtended: React.FC<IProps> = ({
  title,
  value,
  minWidth,
  style,
  secondValue,
  valueColor
}) => {
  const { classes } = useStyles()
  return (
    <Grid flexBasis={minWidth} flexShrink={0.2} style={style} className={classes.container}>
      <Typography className={classes.title}>{title}</Typography>
      {secondValue ? (
        <Grid display='flex' flexDirection='column' height={'40px'}>
          <Box className={classes.value} style={{ color: valueColor }}>
            {value}
          </Box>
          <Box className={classes.secondValue}>{secondValue}</Box>
        </Grid>
      ) : (
        <Box className={classes.value} height={'40px'}>
          {value}
        </Box>
      )}
    </Grid>
  )
}

export default ItemValueExtended
