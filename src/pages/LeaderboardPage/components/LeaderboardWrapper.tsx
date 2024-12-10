import React, { useState, useEffect } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './styles'
import EclipseLogo from '@static/png/eclipse-big-logo.png'
import { Faq } from './Faq/Faq'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { leaderboardSelectors } from '@store/selectors/leaderboard'

export const LeaderboardWrapper: React.FC = () => {
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const { classes } = useStyles()

  const isLoading = useSelector(leaderboardSelectors.loading)
  const leaderboard = useSelector(leaderboardSelectors.leaderboard)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const dispatch = useDispatch()

  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setAlignment(newAlignment)
    }
  }

  useEffect(() => {
    dispatch(actions.getLeaderboardData())
  }, [dispatch])

  const counterItems = React.useMemo(
    () => [
      {
        value: userStats?.totalPoints ?? '0',
        label: 'Your Points',
        styleVariant: classes.counterYourPoints
      },
      {
        value: `# ${userStats?.rank ?? '0'}`,
        label: 'Your ranking position',
        styleVariant: classes.counterYourRanking
      },
      {
        value: userStats?.last24HoursPoints ?? '0',
        label: 'Your points per day',
        styleVariant: classes.counterYourPointsPerDay
      }
    ],
    [userStats, classes]
  )

  const content = React.useMemo(() => {
    return alignment === 'leaderboard' ? (
      <LeaderboardList data={leaderboard} isLoading={isLoading} />
    ) : (
      <Faq />
    )
  }, [alignment, leaderboard, isLoading])

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <img src={EclipseLogo} alt='Eclipse Logo' className={classes.heroLogo} />
        </Box>

        <Box className={classes.counterContainer}>
          {counterItems.map(({ value, label, styleVariant }) => (
            <Box key={label} className={classes.counterItem}>
              <Typography className={styleVariant}>{value}</Typography>
              <Typography className={classes.counterLabel}>{label}</Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '56px',
            width: '100%'
          }}>
          <Box className={classes.switchPoolsContainer}>
            <Box
              className={classes.switchPoolsMarker}
              sx={{
                left: alignment === 'leaderboard' ? 0 : '50%'
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
            </ToggleButtonGroup>
          </Box>
        </Box>

        {content}
      </Box>
    </Box>
  )
}
