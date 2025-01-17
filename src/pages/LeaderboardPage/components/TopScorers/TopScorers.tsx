import { Typography, Box, Hidden } from '@mui/material'
import React, { useMemo } from 'react'
import useStyles from './styles'
import { ScorerItem } from './ScorerItem'
import { ILpEntry, ISwapEntry, ITotalEntry, LeaderBoardType } from '@store/reducers/leaderboard'
import { PublicKey } from '@solana/web3.js'

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
      {firstPlace && secondPlace && thirdPlace && (
        <>
          <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
          <Box className={classes.sectionContent}>
            <Hidden lgUp>
              <ScorerItem
                points={firstPlace.points}
                cupVariant='gold'
                address={new PublicKey(firstPlace.address)}
              />
            </Hidden>
            <ScorerItem
              points={secondPlace.points}
              cupVariant='silver'
              address={new PublicKey(secondPlace.address)}
            />
            <Hidden lgDown>
              <ScorerItem
                points={firstPlace.points}
                cupVariant='gold'
                address={new PublicKey(firstPlace.address)}
              />
            </Hidden>
            <ScorerItem
              points={thirdPlace.points}
              cupVariant='bronze'
              address={new PublicKey(thirdPlace.address)}
            />
          </Box>
        </>
      )}
    </>
  )
}
