import React, { useMemo, useState } from 'react'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { LeaderboardWrapper } from './components/LeaderboardWrapper'
import { InfoComponent } from './components/InfoComponent/InfoComponent'
import { Rewards } from './components/Rewards/Rewards'
import { LeaderboardTimer } from './components/LeaderboardTimer/LeaderboardTimer'
import { useCountdown } from './components/LeaderboardTimer/useCountdown'
import { LAUNCH_DATE } from './config'

export const LeaderBoardPage: React.FC = () => {
  const { classes } = useStyles()
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const [isExpired, setExpired] = useState(false)

  const targetDate = useMemo(() => {
    const date = new Date(LAUNCH_DATE)
    return date
  }, [])

  const { hours, minutes, seconds } = useCountdown({
    targetDate,
    onExpire: () => {
      setExpired(true)
    }
  })

  return (
    <>
      <Grid
        container
        className={classes.container}
        justifyContent='center'
        style={{
          marginTop: isExpired ? '45px' : 'calc(100vh*0.1)'
        }}>
        <Grid item>
          {isExpired ? (
            <LeaderboardWrapper alignment={alignment} setAlignment={setAlignment} />
          ) : (
            <LeaderboardTimer hours={hours} minutes={minutes} seconds={seconds} />
          )}
        </Grid>
      </Grid>
      {alignment === 'leaderboard' ? <InfoComponent /> : null}
      {alignment === 'rewards' ? <Rewards /> : null}
    </>
  )
}

export default LeaderBoardPage
