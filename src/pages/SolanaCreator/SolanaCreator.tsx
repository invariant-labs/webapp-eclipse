import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { CreateToken } from './components/CreateToken/CreateToken'

export const SolanaCreator: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.container} justifyContent='center'>
      <Grid item>
        <CreateToken />
      </Grid>
    </Grid>
  )
}

export default SolanaCreator
