import { Grid, Typography, useMediaQuery } from '@material-ui/core'
import { theme } from '@static/theme'
import React from 'react'
import { useStyles } from './style'

const HeaderList = () => {
  const classes = useStyles()
  const isExSmall = useMediaQuery(theme.breakpoints.down('xs'))

  return (
    <Grid container classes={{ container: classes.container }}>
      {isExSmall ? null : <Typography className={classes.text}>Pair</Typography>}
      <Typography className={classes.text}>You've bought</Typography>
      <Typography className={classes.text}>Redeemable</Typography>
      <Typography className={classes.text}>Vesting progress</Typography>
    </Grid>
  )
}

export default HeaderList
