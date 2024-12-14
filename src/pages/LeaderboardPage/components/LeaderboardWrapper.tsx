import React, { useState, useEffect, useMemo } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import useStyles from './styles'
import { Faq } from './Faq/Faq'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { leaderboardSelectors, topRankedUsers } from '@store/selectors/leaderboard'
import leaderboardGolden from '@static/svg/leaderboardGolden.svg'
import leaderboardSilver from '@static/svg/leaderboardSilver.svg'
import leaderboardBronze from '@static/svg/leaderboardBronze.svg'
import trapezeLeft from '@static/png/trapezeLeft.png'
import trapezeRight from '@static/png/trapezeRight.png'
import infoIcon from '@static/svg/info.svg'
import { BN } from '@coral-xyz/anchor'
import { printBN } from '@utils/utils'
import { shortenAddress } from '@utils/uiUtils'

export const LeaderboardWrapper: React.FC = () => {
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const { classes } = useStyles()

  const isLoading = useSelector(leaderboardSelectors.loading)
  const leaderboard = useSelector(topRankedUsers)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const dispatch = useDispatch()

  const { firstPlace, secondPlace, thirdPlace } = useMemo(() => {
    const firstPlaceItem = leaderboard.find(item => item.rank === 1) || null
    const secondPlaceItem = leaderboard.find(item => item.rank === 2) || null
    const thirdPlaceItem = leaderboard.find(item => item.rank === 3) || null

    return {
      firstPlace: firstPlaceItem
        ? { points: new BN(firstPlaceItem.points, 'hex'), addr: firstPlaceItem.address.toString() }
        : { points: new BN(0), addr: '' },
      secondPlace: secondPlaceItem
        ? {
            points: new BN(secondPlaceItem.points, 'hex'),
            addr: secondPlaceItem.address.toString()
          }
        : { points: new BN(0), addr: '' },
      thirdPlace: thirdPlaceItem
        ? { points: new BN(thirdPlaceItem.points, 'hex'), addr: thirdPlaceItem.address.toString() }
        : { points: new BN(0), addr: '' }
    }
  }, [leaderboard])
  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setAlignment(newAlignment)
    }
  }

  useEffect(() => {
    dispatch(actions.getLeaderboardData())
  }, [dispatch])

  const content = React.useMemo(() => {
    return alignment === 'leaderboard' ? (
      <LeaderboardList data={leaderboard} isLoading={isLoading} />
    ) : (
      <Faq />
    )
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
            width: '100%'
          }}>
          <Typography className={classes.leaderboardHeaderSectionTitle}>Your Progress</Typography>
          <Box className={classes.sectionContent}>
            <Box
              sx={{
                width: '235px',
                height: '88px',
                backgroundImage: `url(${trapezeLeft})`,
                backgroundSize: 'cover',
                boxSizing: 'border-box'
              }}>
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '100%',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start'
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px'
                  }}>
                  <Typography className={classes.headerSmallText}>Total Points</Typography>
                  <Tooltip
                    title={
                      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'
                    }
                    placement='bottom'
                    classes={{
                      tooltip: classes.tooltip
                    }}>
                    <img src={infoIcon} alt='i' width={14} />
                  </Tooltip>
                </Box>
                <Typography className={classes.headerBigText}>
                  {userStats ? printBN(userStats.points, 6) : 0}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                boxSizing: 'border-box',
                width: '235px',
                height: '88px',
                backgroundImage: `url(${trapezeRight})`,
                backgroundSize: 'cover'
              }}>
              <Box
                sx={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '100%',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start'
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px'
                  }}>
                  <Typography className={classes.headerSmallText}>Global Rank</Typography>
                  <Tooltip
                    title={
                      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'
                    }
                    placement='bottom'
                    classes={{
                      tooltip: classes.tooltip
                    }}>
                    <img src={infoIcon} alt='i' width={14} />
                  </Tooltip>
                </Box>
                <Typography className={classes.headerBigText}>
                  {userStats ? userStats.rank : 0}
                </Typography>
              </Box>
            </Box>
          </Box>
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
          <Typography className={classes.leaderboardHeaderSectionTitle}>Top Scorers</Typography>
          <Box className={classes.sectionContent}>
            <Box className={classes.topScorersItem}>
              <img src={leaderboardSilver} alt='Silver' />
              <Box className={classes.topScorersItemBox}>
                <Typography className={classes.headerBigText}>
                  {printBN(secondPlace.points, 6)} Points
                </Typography>
                <Typography className={classes.headerSmallText}>
                  {shortenAddress(secondPlace.addr, 4)}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.topScorersItem}>
              <img src={leaderboardGolden} alt='Gold' />
              <Box className={classes.topScorersItemBox}>
                <Typography className={classes.headerBigText}>
                  {printBN(firstPlace.points, 6)} Points
                </Typography>
                <Typography className={classes.headerSmallText}>
                  {shortenAddress(firstPlace.addr, 4)}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.topScorersItem}>
              <img src={leaderboardBronze} alt='Bronze' />
              <Box className={classes.topScorersItemBox}>
                <Typography className={classes.headerBigText}>
                  {printBN(thirdPlace.points, 6)} Points
                </Typography>
                <Typography className={classes.headerSmallText}>
                  {shortenAddress(thirdPlace.addr, 4)}
                </Typography>
              </Box>
            </Box>
          </Box>
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
            Points Leaderboard
          </Typography>
          <Box className={classes.switchPoolsContainer}>
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
                      case 'reward':
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
                FAQ (questions)
              </ToggleButton>
              <ToggleButton value={'rewards'} disableRipple className={classes.switchPoolsButton}>
                Rewards
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {content}
      </Box>
    </Box>
  )
}
