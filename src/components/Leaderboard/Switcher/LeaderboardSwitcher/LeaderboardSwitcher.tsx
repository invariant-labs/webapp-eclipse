import React from 'react'
import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { theme } from '@static/theme'
import { arrowLeftIcon, arrowRightIcon, dropdownIcon, dropdownReverseIcon } from '@static/icons'
import { LeaderBoardType } from '@store/consts/static'

interface LeaderboardListProps {
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  selectedOption: LeaderBoardType
  setSelectedOption: React.Dispatch<React.SetStateAction<LeaderBoardType>>
  availableOptions: LeaderBoardType[]
  isMenuOpen: boolean
}

const LeaderboardSwitcher: React.FC<LeaderboardListProps> = ({
  handleClick,
  selectedOption,
  setSelectedOption,
  availableOptions,
  isMenuOpen
}) => {
  const { classes } = useStyles()

  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box className={classes.leaderboardTypeBox}>
      {!isMobile ? (
        <Button
          className={classes.leaderboardTypeButton}
          disableRipple
          disableFocusRipple
          onClick={handleClick}>
          <Typography className={classes.leaderboardTypeText}>{selectedOption}</Typography>
          {!isMenuOpen ? (
            <img src={dropdownIcon} alt='' />
          ) : (
            <img src={dropdownReverseIcon} alt='' />
          )}
        </Button>
      ) : (
        <Box className={classes.optionWrapper}>
          <Box
            className={classes.firstOption}
            onClick={() =>
              setSelectedOption((prev: LeaderBoardType) => {
                const idx = availableOptions.findIndex(item => item === prev)!
                if (idx - 1 < 0) {
                  return availableOptions[availableOptions.length - 1]
                }
                return availableOptions[idx - 1]
              })
            }>
            <img src={arrowLeftIcon} alt='' style={{ cursor: 'pointer' }} />
            <Typography className={classes.mobileTypeSwitcherSubtitle}>
              {availableOptions.findIndex(item => item === selectedOption)! - 1 < 0
                ? availableOptions[availableOptions.length - 1]
                : availableOptions[
                availableOptions.findIndex(item => item === selectedOption)! - 1
                ]}
            </Typography>
          </Box>
          <Typography className={classes.mobileTypeSwitcherTitle}>{selectedOption}</Typography>
          <Box
            className={classes.lastOption}
            onClick={() =>
              setSelectedOption(prev => {
                const idx = availableOptions.findIndex(item => item === prev)!
                if (idx + 1 === availableOptions.length) {
                  return availableOptions[0]
                }
                return availableOptions[idx + 1]
              })
            }>
            <Typography className={classes.mobileTypeSwitcherSubtitle}>
              {availableOptions.findIndex(item => item === selectedOption)! + 1 ===
                availableOptions.length
                ? availableOptions[0]
                : availableOptions[
                availableOptions.findIndex(item => item === selectedOption)! + 1
                ]}
            </Typography>
            <img src={arrowRightIcon} alt='' style={{ cursor: 'pointer' }} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default LeaderboardSwitcher
