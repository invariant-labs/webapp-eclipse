import React from 'react'
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import useStyles from './styles'
import { LeaderBoardType, PointsPageContent } from '@store/consts/static'
import LeaderboardSwitcher from './LeaderboardSwitcher/LeaderboardSwitcher'

interface ISwitcherProps {
  alignment: PointsPageContent
  setAlignment: React.Dispatch<React.SetStateAction<PointsPageContent>>
  type: LeaderBoardType
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  selectedOption: LeaderBoardType
  setSelectedOption: React.Dispatch<React.SetStateAction<LeaderBoardType>>
  availableOptions: LeaderBoardType[]
  isMenuOpen: boolean
}

export const Switcher: React.FC<ISwitcherProps> = ({
  alignment,
  setAlignment,
  type,
  handleClick,
  availableOptions,
  isMenuOpen,
  selectedOption,
  setSelectedOption
}) => {
  const { classes } = useStyles({ alignment })

  const handleSwitchPools = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: PointsPageContent | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
    }
  }

  return (
    <Box className={classes.mainWrapper}>
      <Typography className={classes.leaderboardHeaderSectionTitle}>
        {(() => {
          switch (alignment) {
            case 'leaderboard':
              return type === 'Liquidity'
                ? 'Liquidity Leaderboard'
                : type === 'Swap'
                  ? 'Swap Leaderboard'
                  : 'Total Leaderboard'
            case 'faq':
              return 'Frequent questions'
            case 'claim':
              return 'Claim'
            default:
              return 0
          }
        })()}
      </Typography>
      <Box className={classes.switchWrapper}>
        {alignment === PointsPageContent.Leaderboard && (
          <LeaderboardSwitcher
            handleClick={handleClick}
            isMenuOpen={isMenuOpen}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            availableOptions={availableOptions}
          />
        )}
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
              value='claim'
              disableRipple
              className={classes.switchPoolsButton}
              style={{ fontWeight: alignment === 'claim' ? 700 : 400 }}>
              Claim
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  )
}
