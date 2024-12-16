import React, { useEffect } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './styles'
import { Faq } from './Faq/Faq'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { leaderboardSelectors, topRankedUsers } from '@store/selectors/leaderboard'

import { YourProgress } from './YourProgress/YourProgress'
import { TopScorers } from './TopScorers/TopScorers'
import { Switcher } from './Switcher/Switcher'

interface LeaderboardWrapperProps {
  alignment: string
  setAlignment: React.Dispatch<React.SetStateAction<string>>
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({
  alignment,
  setAlignment
}) => {
  const { classes } = useStyles()

  const isLoading = useSelector(leaderboardSelectors.loading)
  const leaderboard = useSelector(topRankedUsers)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  const top3Scorers = useSelector(leaderboardSelectors.top3Scorers)

  useEffect(() => {
    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
  }, [dispatch, itemsPerPage])

  const content = React.useMemo(() => {
    if (alignment === 'leaderboard') {
      return <LeaderboardList data={leaderboard} isLoading={isLoading} />
    } else if (alignment === 'faq') {
      return <Faq />
    }
  }, [alignment, leaderboard, isLoading])

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
          {/* <Box className={classes.switchPoolsContainer}>
            <Box
              className={classes.switchPoolsMarker}
              sx={{
                left: {
                  xs: (() => {
                    switch (alignment) {
                      case 'leaderboard':
                        return 0
                      case 'faq':
                        return '50%'
                      case 'rewards':
                        return '100%'
                      default:
                        return 0
                    }
                  })(),
                  md: alignment === 'leaderboard' ? 0 : alignment === 'faq' ? '50%' : '100%',
                  transform:
                    alignment === 'leaderboard'
                      ? 'none'
                      : alignment === 'faq'
                        ? 'translateX(-50%)'
                        : 'translateX(-100%)'
                }
              }}
            />
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleSwitchPools}
              className={classes.switchPoolsButtonsGroup}>
              <ToggleButton
                value={'leaderboard'}
                disableRipple
                className={classes.switchPoolsButton}>
                Leaderboard
              </ToggleButton>
              <ToggleButton value={'faq'} disableRipple className={classes.switchPoolsButton}>
                FAQ
              </ToggleButton>
              <ToggleButton value={'rewards'} disableRipple className={classes.switchPoolsButton}>
                Rewards
              </ToggleButton>
            </ToggleButtonGroup>
          </Box> */}
        </Box>

        {content}
      </Box>
    </Box>
  )
}
