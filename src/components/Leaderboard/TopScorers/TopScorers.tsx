import { Typography, Box, Hidden } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './styles'
import { ScorerItem } from './ScorerItem'
import { ILpEntry, ISwapEntry, ITotalEntry } from '@store/reducers/leaderboard'
import { LeaderBoardType } from '@store/consts/static'

interface ITopScorersProps {
  top3Scorers: {
    total: ITotalEntry[]
    swap: ISwapEntry[]
    lp: ILpEntry[]
  }
  type: LeaderBoardType
}

export const TopScorers: React.FC<ITopScorersProps> = ({ top3Scorers, type }) => {
  const { classes } = useStyles()
  const currentTop3 = useMemo(() => {
    if (type === 'Liquidity') return top3Scorers.lp
    if (type === 'Swap') return top3Scorers.swap
    return top3Scorers.total
  }, [type, top3Scorers])
  const [firstPlace, secondPlace, thirdPlace] = currentTop3
  return (
    <>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
      <Box className={classes.sectionContent}>
        <Hidden lgUp>
          <ScorerItem
            points={firstPlace?.points ?? '00'}
            cupVariant='gold'
            address={firstPlace?.address ?? ''}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
            domain={firstPlace?.domain}
          />
        </Hidden>
        <Box className={classes.innerSectionContent}>
          <ScorerItem
            points={secondPlace?.points ?? '00'}
            cupVariant='silver'
            address={secondPlace?.address ?? ''}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
            domain={secondPlace?.domain}
          />
          <Hidden lgDown>
            <ScorerItem
              points={firstPlace?.points ?? '00'}
              cupVariant='gold'
              address={firstPlace?.address ?? ''}
              showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
              domain={firstPlace?.domain}
            />
          </Hidden>
          <ScorerItem
            points={thirdPlace?.points ?? '00'}
            cupVariant='bronze'
            address={thirdPlace?.address ?? ''}
            showPlaceholder={!firstPlace || !secondPlace || !thirdPlace}
            domain={thirdPlace?.domain}
          />
        </Box>
      </Box>
    </>
  )
}
