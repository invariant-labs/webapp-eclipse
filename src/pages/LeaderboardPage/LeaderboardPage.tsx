import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { LeaderboardWrapper } from './components/LeaderboardWrapper'
import { InfoComponent } from './components/InfoComponent/InfoComponent'

export const LeaderBoardPage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <>
      <Grid container className={classes.container} justifyContent='center'>
        <Grid item>
          <LeaderboardWrapper />
        </Grid>
      </Grid>
      <InfoComponent />
    </>
  )
}

export default LeaderBoardPage
