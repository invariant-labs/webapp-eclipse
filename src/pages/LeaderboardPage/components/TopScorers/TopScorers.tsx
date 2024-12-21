import { Typography, Box, Hidden } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { LeaderboardEntry } from '@store/reducers/leaderboard'
import { ScorerItem } from './ScorerItem'

interface ITopScorersProps {
  top3Scorers: LeaderboardEntry[]
}

export const TopScorers: React.FC<ITopScorersProps> = ({ top3Scorers }) => {
  const { classes } = useStyles()
  const [firstPlace, secondPlace, thirdPlace] = top3Scorers
  return (
    <>
      {firstPlace && secondPlace && thirdPlace && (
        <>
          <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
          <Box className={classes.sectionContent}>
            <Hidden lgUp>
              <ScorerItem
                points={firstPlace.points}
                cupVariant='gold'
                address={firstPlace.address}
              />
            </Hidden>
            <ScorerItem
              points={secondPlace.points}
              cupVariant='silver'
              address={secondPlace.address}
            />
            <Hidden lgDown>
              <ScorerItem
                points={firstPlace.points}
                cupVariant='gold'
                address={firstPlace.address}
              />
            </Hidden>
            <ScorerItem
              points={thirdPlace.points}
              cupVariant='bronze'
              address={thirdPlace.address}
            />
          </Box>
        </>
      )}
    </>
  )
}
