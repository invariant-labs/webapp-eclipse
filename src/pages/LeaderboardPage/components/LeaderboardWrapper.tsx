import React, { useState, useEffect } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import useStyles from './styles'
import EclipseLogo from '@static/png/eclipse-big-logo.png'
import { Faq } from './Faq/Faq'
import { LeaderboardItemProps } from './LeaderboardItem/LeaderboardItem'
import LeaderboardList from './LeaderboardList/LeaderboardList'

const generateRandomListElement = (): LeaderboardItemProps => {
  const randomHex = (length: number) => {
    const hexChars = '0123456789abcdef'
    return Array.from({ length }, () => hexChars[Math.floor(Math.random() * hexChars.length)]).join(
      ''
    )
  }

  return {
    displayType: 'item',
    address: `0x${randomHex(254)}`,
    totalPoints: Math.floor(Math.random() * 10000),
    tokenIndex: Math.floor(Math.random() * 100),
    hideBottomLine: Math.random() < 0.5,
    pointsIncome: Math.floor(Math.random() * 5000),
    liquidityPositions: Math.floor(Math.random() * 20)
  }
}

const generateRandomList = (count: number): LeaderboardItemProps[] =>
  Array.from({ length: count }, () => generateRandomListElement())

export const LeaderboardWrapper: React.FC = () => {
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const [data, setData] = useState<LeaderboardItemProps[]>([])
  const { classes } = useStyles()

  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment) {
      setAlignment(newAlignment)
    }
  }

  useEffect(() => {
    setData(generateRandomList(100))
  }, [])

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <img src={EclipseLogo} alt='Eclipse Logo' className={classes.heroLogo} />
        </Box>

        <Box className={classes.counterContainer}>
          {[
            { value: '123 123', label: 'Your Points', styleVariant: classes.counterYourPoints },
            {
              value: '# 12 938',
              label: 'Your ranking position',
              styleVariant: classes.counterYourRanking
            },
            {
              value: '123 123',
              label: 'Your points per day',
              styleVariant: classes.counterYourPointsPerDay
            }
          ].map(({ value, label, styleVariant }) => (
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

        {alignment === 'leaderboard' ? <LeaderboardList data={data} /> : <Faq />}
      </Box>
    </Box>
  )
}
