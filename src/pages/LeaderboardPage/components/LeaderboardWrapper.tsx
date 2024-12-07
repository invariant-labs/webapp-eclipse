import useStyles from './styles'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import EclipseLogo from '@static/png/eclipse-big-logo.png'
import { useEffect, useState } from 'react'
import ItemList, { ListElement } from './ItemList/ItemList'
import { Faq } from './Faq/Faq'
export const LeaderboardWrapper: React.FC = () => {
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const [_page, setPage] = useState(1)

  const { classes } = useStyles()
  const [data, setData] = useState<ListElement[]>([])
  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
      setPage(1)
    }
  }
  useEffect(() => {
    const generateRandomListElement = () => {
      // Helper function to generate a random hex string of a given length
      const randomHex = (length: number) => {
        const hexChars = '0123456789abcdef'
        let result = ''
        for (let i = 0; i < length; i++) {
          result += hexChars.charAt(Math.floor(Math.random() * hexChars.length))
        }
        return result
      }

      return {
        displayType: 'default',
        username: `0x${randomHex(254)}`, // 0x + 254 characters
        totalPoints: Math.floor(Math.random() * 10000), // Random points (0 - 9999)
        tokenIndex: Math.floor(Math.random() * 100), // Random token index (0 - 99)
        hideBottomLine: Math.random() < 0.5, // Random true/false
        pointsIncome: Math.floor(Math.random() * 5000), // Random income (0 - 4999)
        liquidityPositions: Math.floor(Math.random() * 20) // Random positions (0 - 19)
      }
    }

    const generateRandomList = (count: number) => {
      const list: ListElement[] = []
      for (let i = 0; i < count; i++) {
        list.push(generateRandomListElement())
      }
      return list
    }

    setData(generateRandomList(10000))
  }, [])

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <img src={EclipseLogo} alt='Eclipse Logo' className={classes.heroLogo} />
        </Box>
        <Box className={classes.counterContainer}>
          <Box className={classes.counterItem}>
            <Typography className={classes.counterYourPoints}>123 123</Typography>
            <Typography className={classes.counterLabel}>Your Points</Typography>
          </Box>
          <Box className={classes.counterItem}>
            <Typography className={classes.counterYourRanking}># 12 938</Typography>
            <Typography className={classes.counterLabel}>Your ranking position</Typography>
          </Box>
          <Box className={classes.counterItem}>
            <Typography className={classes.counterYourPointsPerDay}>123 123</Typography>
            <Typography className={classes.counterLabel}>Your points per day</Typography>
          </Box>
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
        {alignment === 'leaderboard' ? <ItemList data={data} /> : <Faq />}
      </Box>
    </Box>
  )
}
