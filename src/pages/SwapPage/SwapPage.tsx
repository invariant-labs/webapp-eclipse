import React from 'react'
import WrappedSwap from '@containers/WrappedSwap/WrappedSwap'
import useStyles from './styles'
import { Grid } from '@material-ui/core'

export const SwapPage: React.FC = () => {
  const classes = useStyles()

  return (
    <Grid container className={classes.container}>
      <WrappedSwap />
    </Grid>
  )
}

export default SwapPage
