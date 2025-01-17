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
      <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
      <Box className={classes.sectionContent}>
        <Hidden lgUp>
          <ScorerItem
            points={firstPlace?.points ?? null}
            cupVariant='gold'
            address={firstPlace?.address ?? null}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
          />
        </Hidden>
        <ScorerItem
          points={firstPlace?.points ?? null}
          cupVariant='silver'
          address={firstPlace?.address ?? null}
          showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
        />
        <Hidden lgDown>
          <ScorerItem
            points={firstPlace?.points ?? null}
            cupVariant='gold'
            address={firstPlace?.address ?? null}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
          />
        </Hidden>
        <ScorerItem
          points={firstPlace?.points ?? null}
          cupVariant='bronze'
          address={firstPlace?.address ?? null}
          showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
        />
      </Box>
    </>
  )
}
