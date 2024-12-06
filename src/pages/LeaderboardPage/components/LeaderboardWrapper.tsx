import useStyles from './styles'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import EclipseLogo from '@static/png/eclipse-big-logo.png'
import { useState } from 'react'
import ItemList from './ItemList/ItemList'
import { Faq } from './Faq/Faq'
export const LeaderboardWrapper: React.FC = () => {
  const [alignment, setAlignment] = useState<string>('leaderboard')
  const [_page, setPage] = useState(1)

  const { classes } = useStyles()
  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
      setPage(1)
    }
  }
  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <img src={EclipseLogo} alt='Eclipse Logo' className={classes.heroLogo} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '56px',
            '& > * + *': {
              marginLeft: '6rem'
            }
          }}>
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
        {alignment === 'leaderboard' ? <ItemList /> : <Faq />}
      </Box>
    </Box>
  )
}
