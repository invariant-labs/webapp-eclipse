import React, { useState } from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { LeaderboardWrapper } from './components/LeaderboardWrapper'
import { InfoComponent } from './components/InfoComponent/InfoComponent'
import { Rewards } from './components/Rewards/Rewards'

export const LeaderBoardPage: React.FC = () => {
  const { classes } = useStyles()
  const [alignment, setAlignment] = useState<string>('leaderboard')

  return (
    <>
      <Grid container className={classes.container} justifyContent='center'>
        <Grid item>
          <LeaderboardWrapper alignment={alignment} setAlignment={setAlignment} />
        </Grid>
      </Grid>
      {alignment === 'leaderboard' ? <InfoComponent /> : null}
      {alignment === 'rewards' ? <Rewards /> : null}
    </>
  )
}

export default LeaderBoardPage
