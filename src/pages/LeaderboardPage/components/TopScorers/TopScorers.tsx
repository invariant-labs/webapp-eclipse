import { Typography, Box, Hidden } from '@mui/material'
import React from 'react'
import useStyles from './styles'
import { LeaderboardEntry } from '@store/reducers/leaderboard'
import { ScorerItem } from './ScorerItem'
import { BN } from '@coral-xyz/anchor'

interface ITopScorersProps {
  top3Scorers: LeaderboardEntry[]
}

export const TopScorers: React.FC<ITopScorersProps> = ({ top3Scorers }) => {
  const { classes } = useStyles()
  const [firstPlace, secondPlace, thirdPlace] = top3Scorers
  console.log(firstPlace, secondPlace, thirdPlace)
  return (
    <>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
      <Box className={classes.sectionContent}>
        <Hidden lgUp>
          <ScorerItem
            points={new BN(firstPlace?.points, 'hex') ?? null}
            cupVariant='gold'
            address={firstPlace?.address ?? null}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
          />
        </Hidden>
        <ScorerItem
          points={new BN(secondPlace?.points, 'hex') ?? null}
          cupVariant='silver'
          address={secondPlace?.address ?? null}
          showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
        />
        <Hidden lgDown>
          <ScorerItem
            points={new BN(firstPlace?.points, 'hex') ?? null}
            cupVariant='gold'
            address={firstPlace?.address ?? null}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
          />
        </Hidden>
        <ScorerItem
          points={new BN(thirdPlace?.points, 'hex') ?? null}
          cupVariant='bronze'
          address={thirdPlace?.address ?? null}
          showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
        />
      </Box>
    </>
  )
}
