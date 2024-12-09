import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { LeaderboardWrapper } from './components/LeaderboardWrapper'

export const LeaderBoardPage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.container} justifyContent='center'>
      <Grid item>
        <LeaderboardWrapper />
      </Grid>
    </Grid>
  )
}

export default LeaderBoardPage
