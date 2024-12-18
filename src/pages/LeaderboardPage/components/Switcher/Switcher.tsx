// Switcher.tsx
import React from 'react'
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material'
import useStyles from './styles'

interface ISwitcherProps {
  alignment: string
  setAlignment: React.Dispatch<React.SetStateAction<string>>
}

export const Switcher: React.FC<ISwitcherProps> = ({ alignment, setAlignment }) => {
  const { classes } = useStyles({ alignment })

  const handleSwitchPools = (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
    }
  }

  return (
    <Box className={classes.switchPoolsContainer}>
      <Box className={classes.switchPoolsMarker} />
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={handleSwitchPools}
        className={classes.switchPoolsButtonsGroup}>
        <ToggleButton value='leaderboard' disableRipple className={classes.switchPoolsButton}>
          Leaderboard
        </ToggleButton>
        <ToggleButton value='faq' disableRipple className={classes.switchPoolsButton}>
          FAQ
        </ToggleButton>
        <ToggleButton value='rewards' disableRipple className={classes.switchPoolsButton}>
          Rewards
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}