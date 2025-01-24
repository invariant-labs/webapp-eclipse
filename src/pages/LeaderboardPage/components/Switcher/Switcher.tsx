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
        <ToggleButton
          value='leaderboard'
          disableRipple
          className={classes.switchPoolsButton}
          style={{ fontWeight: alignment === 'leaderboard' ? 700 : 400 }}>
          Leaderboard
        </ToggleButton>
        <ToggleButton
          value='faq'
          disableRipple
          className={classes.switchPoolsButton}
          style={{ fontWeight: alignment === 'faq' ? 700 : 400 }}>
          FAQ
        </ToggleButton>
        <ToggleButton
          value='referral'
          disableRipple
          className={classes.switchPoolsButton}
          style={{ fontWeight: alignment === 'referral' ? 700 : 400 }}>
          Referral
        </ToggleButton>
        <ToggleButton
          value='claim'
          disableRipple
          className={classes.switchPoolsButton}
          style={{ fontWeight: alignment === 'claim' ? 700 : 400 }}>
          Claim
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
