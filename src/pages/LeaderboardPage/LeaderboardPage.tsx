import React from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { LeaderboardTimer } from './components/LeaderboardTimer/LeaderboardTimer'
import { useCountdown } from './components/LeaderboardTimer/useCountdown'
import { LAUNCH_DATE } from './config'
import { InfoComponent } from './components/InfoComponent/InfoComponent'

export const LeaderBoardPage: React.FC = () => {
  const { classes } = useStyles()

  const { hours, minutes, seconds } = useCountdown({
    targetDate: LAUNCH_DATE,
    onExpire: () => {}
  })

  return (
    <>
      <Grid
        container
        className={classes.container}
        justifyContent='center'
        style={{
          marginTop: 'calc(100vh*0.1)'
        }}>
        <Grid item>
          <LeaderboardTimer hours={hours} minutes={minutes} seconds={seconds} />
        </Grid>
      </Grid>
      <InfoComponent />
    </>
  )
}

export default LeaderBoardPage
