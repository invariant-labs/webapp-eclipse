import React from 'react'
import useStyles from './style'
import { Grid, Typography } from '@mui/material'
import { emptyIcon } from '@static/icons'

export interface INotFoundPlaceholder {
  title: string
  subtitle?: string
  isStats?: boolean
}

const NotFoundPlaceholder: React.FC<INotFoundPlaceholder> = ({ title, subtitle, isStats }) => {
  const { classes, cx } = useStyles({ isStats })

  return (
    <Grid container className={cx(classes.root, { [classes.container]: isStats })}>
      <img className={classes.img} src={emptyIcon} alt='Not connected' />
      <Typography className={classes.title}>{title}</Typography>
      {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
    </Grid>
  )
}

export default NotFoundPlaceholder
