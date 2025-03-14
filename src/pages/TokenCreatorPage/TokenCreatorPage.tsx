import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { TokenCreatorWrapper } from '@containers/TokenCreatorWrapper/TokenCreatorWrapper'

export const TokenCreatorPage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.container}>
      <Grid item>
        <TokenCreatorWrapper />
      </Grid>
    </Grid>
  )
}

export default TokenCreatorPage
