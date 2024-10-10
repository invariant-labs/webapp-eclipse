import React from 'react'
import useStyles from './styles'
import { Grid } from '@material-ui/core'
import { CreateToken } from './components/CreateToken/CreateToken'

export const SolanaCreator: React.FC = () => {
  const classes = useStyles()
  return (
    <Grid container className={classes.container}>
      <CreateToken />
    </Grid>
  )
}

export default SolanaCreator
