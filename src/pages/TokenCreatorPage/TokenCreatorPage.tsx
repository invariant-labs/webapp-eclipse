import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { TokenCreatorWrapper } from '@containers/TokenCreatorWrapper/TokenCreatorWrapper'

export const TokenCreatorPage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.container} justifyContent='center'>
      <Grid item>
        <TokenCreatorWrapper />
      </Grid>
    </Grid>
  )
}

export default TokenCreatorPage
