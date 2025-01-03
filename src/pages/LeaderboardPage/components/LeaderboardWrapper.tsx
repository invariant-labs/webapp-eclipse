import React, { useEffect, useMemo } from 'react'
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
import { actions as positionListActions } from '@store/reducers/positions'
import { YourProgress } from './YourProgress/YourProgress'
import { TopScorers } from './TopScorers/TopScorers'
import { Switcher } from './Switcher/Switcher'
import { RewardedPools } from './RewardedPools/RewardedPools'
import { network } from '@store/selectors/solanaConnection'
import { VariantType } from 'notistack'
import { poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { actions as statsActions } from '@store/reducers/stats'
import { positionsWithPoolsData } from '@store/selectors/positions'
import { estimatePointsForUserPositions } from '@invariant-labs/points-sdk'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '../config'
import { PoolStructure, Position } from '@invariant-labs/sdk-eclipse/src/market'
import { isLoadingPositionsList } from '@store/selectors/positions'
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
  const list = useSelector(positionsWithPoolsData)
  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  const promotedPools = useSelector(getPromotedPools)
  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const promotedPoolsData = promotedPools
    .map(promotedPool =>
      poolsList.find(poolWithData => poolWithData.poolAddress.toString() === promotedPool.address)
    )
    .filter(poolData => !!poolData)
    .map(poolWithData => {
      return {
        ...poolWithData,
        pointsPerSecond: promotedPools.find(
          promotedPool => poolWithData.poolAddress.toString() === promotedPool.address
        )!.pointsPerSecond
      }
    })
  useEffect(() => {
    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
    dispatch(actions.getLeaderboardConfig())
    dispatch(statsActions.getCurrentStats())
    dispatch(positionListActions.getPositionsList())
  }, [dispatch, itemsPerPage])

  const estimated24hPoints = useMemo(() => {
    const eligiblePositions = {}
    list.forEach(position => {
      if (promotedPools.some(pool => pool.address === position.pool.toString())) {
        const v = eligiblePositions[position.pool.toString()]
        if (!v) {
          eligiblePositions[position.pool.toString()] = [position]
        } else {
          eligiblePositions[position.pool.toString()].push(position)
        }
      }
    })

    const estimation: BN = Object.values(eligiblePositions).reduce((acc: BN, positions: any) => {
      const estimation = estimatePointsForUserPositions(
        positions as Position[],
        positions[0].poolData as PoolStructure,
        new BN(
          promotedPools.find(
            pool => pool.address === positions[0].pool.toString()
          )!.pointsPerSecond,
          'hex'
        ).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
      )

      return acc.add(estimation)
    }, new BN(0))

    return estimation
  }, [userStats, list])

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
            width: '100%'
          }}>
          <YourProgress
            userStats={userStats}
            estimated24hPoints={estimated24hPoints}
            isLoadingList={isLoadingList}
          />
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
            width: '100%',
            marginTop: '24px'
          }}>
          <Typography className={classes.leaderboardHeaderSectionTitle}>
            {(() => {
              switch (alignment) {
                case 'leaderboard':
                  return 'Point Leaderboard'
                case 'faq':
                  return 'Frequent questions'
                case 'claim':
                  return 'Claim'
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
