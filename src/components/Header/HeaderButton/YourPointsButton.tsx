import React from 'react'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Button, useMediaQuery } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import YourPointsModal from '@components/Modals/YourPointsModal/YourPointsModals'
import { theme } from '@static/theme'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'

export interface IProps {
  disabled?: boolean
}
export const YourPointsButton: React.FC<IProps> = ({ disabled = false }) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [openNetworks, setOpenNetworks] = React.useState<boolean>(false)
  const currentUser = useSelector(leaderboardSelectors.currentUser)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setOpenNetworks(true)
  }

  const formatLargeNumber = (number: number) => {
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Q']

    if (number < 1000) {
      return number.toFixed(1)
    }

    const suffixIndex = Math.floor(Math.log10(number) / 3)
    const scaledNumber = number / Math.pow(1000, suffixIndex)

    return `${scaledNumber.toFixed(1)}${suffixes[suffixIndex]}`
  }

  const handleClose = () => {
    unblurContent()
    setOpenNetworks(false)
  }

  return (
    <>
      <Button
        className={classes.pointsHeaderButton}
        variant='contained'
        classes={{ disabled: classes.disabled }}
        disabled={disabled}
        onClick={handleClick}>
        {isSm ? (
          <KeyboardArrowDownIcon id='downIcon' />
        ) : (
          `Points: ${formatLargeNumber(currentUser?.points ?? 0)}`
        )}
      </Button>
      <YourPointsModal open={openNetworks} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}
