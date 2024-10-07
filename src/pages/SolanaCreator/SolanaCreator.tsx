import React, { useState } from 'react'
// import WrappedSwap from '@containers/WrappedSwap/WrappedSwap'
import useStyles from './styles'
import { Grid } from '@material-ui/core'
import { CreateToken } from './components/CreateToken/CreateToken'

export const SolanaCreator: React.FC = () => {
  const classes = useStyles()
  // const [value, setValue] = useState('')
  // const searchFarm = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setValue(e.target.value.toLowerCase())
  // }
  return (
    <Grid container className={classes.container}>
      <CreateToken />
      {/* <SearchInput handleChange={searchFarm} value={value} /> */}
      {/* <WrappedSwap /> */}
    </Grid>
  )
}

export default SolanaCreator
