import React, { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import useStyles from './styles'
import { Faq } from './Faq/Faq'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import {
  getPromotedPools,
  leaderboardSelectors,
  topRankedUsers
} from '@store/selectors/leaderboard'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { YourProgress } from './YourProgress/YourProgress'
import { TopScorers } from './TopScorers/TopScorers'
import { Switcher } from './Switcher/Switcher'
import { RewardedPools } from './RewardedPools/RewardedPools'
import { network } from '@store/selectors/solanaConnection'
import { VariantType } from 'notistack'
import { poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { actions as statsActions } from '@store/reducers/stats'

interface LeaderboardWrapperProps {
  alignment: string
  setAlignment: React.Dispatch<React.SetStateAction<string>>
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({
  alignment,
  setAlignment
}) => {
  const { classes } = useStyles()
  const currentNetwork = useSelector(network)

  const isLoading = useSelector(leaderboardSelectors.loading)
  const leaderboard = useSelector(topRankedUsers)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const top3Scorers = useSelector(leaderboardSelectors.top3Scorers)
  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  const promotedPools = useSelector(getPromotedPools)
  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const promotedPoolsData = promotedPools
    .map(pool => poolsList.find(poolWithData => poolWithData.poolAddress.toString() === pool))
    .filter(poolData => !!poolData)
  useEffect(() => {
    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
    dispatch(statsActions.getCurrentStats())
  }, [dispatch, itemsPerPage])

  const content = React.useMemo(() => {
    if (alignment === 'leaderboard') {
      return <LeaderboardList data={leaderboard} isLoading={isLoading} />
    } else if (alignment === 'faq') {
      return <Faq />
    }
  }, [alignment, leaderboard, isLoading])

  const copyAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarActions.add({
        message,
        variant,
        persist: false
      })
    )
  }
  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.leaderBoardWrapper}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            marginTop: '56px',
            width: '100%'
          }}>
          <YourProgress userStats={userStats} />
          <RewardedPools
            network={currentNetwork}
            copyAddressHandler={copyAddressHandler}
            rewardedPoolsData={promotedPoolsData}
          />
          <TopScorers top3Scorers={top3Scorers} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            marginTop: '56px',
            width: '100%'
          }}>
          <Typography className={classes.leaderboardHeaderSectionTitle}>
            {(() => {
              switch (alignment) {
                case 'leaderboard':
                  return 'Point Leaderboard'
                case 'faq':
                  return 'Frequent questions'
                case 'rewards':
                  return 'Rewards'
                default:
                  return 0
              }
            })()}
          </Typography>
          <Switcher alignment={alignment} setAlignment={setAlignment} />
        </Box>

        {content}
      </Box>
    </Box>
  )
}
