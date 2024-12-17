import React, { useMemo, useState } from 'react'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Button, useMediaQuery } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import YourPointsModal from '@components/Modals/YourPointsModal/YourPointsModals'
import { theme } from '@static/theme'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { formatLargeNumber } from '@utils/formatBigNumber'
import { LAUNCH_DATE } from '@pages/LeaderboardPage/config'
import { useCountdown } from '@pages/LeaderboardPage/components/LeaderboardTimer/useCountdown'
import icons from '@static/icons'

export interface IProps {
  disabled?: boolean
}
export const YourPointsButton: React.FC<IProps> = ({ disabled = false }) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const [isExpired, setExpired] = useState(false)
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [openNetworks, setOpenNetworks] = React.useState<boolean>(false)
  const currentUser = useSelector(leaderboardSelectors.currentUser)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setOpenNetworks(true)
  }

  const handleClose = () => {
    unblurContent()
    setOpenNetworks(false)
  }

  const targetDate = useMemo(() => {
    const date = new Date(LAUNCH_DATE)
    return date
  }, [])

  useCountdown({
    targetDate,
    onExpire: () => {
      setExpired(true)
    }
  })

  return (
    <>
      <Button
        className={classes.pointsHeaderButton}
        variant='contained'
        classes={{ disabled: classes.disabled }}
        disabled={disabled}
        onClick={handleClick}>
        {isExpired ? (
          <>
            {isSm ? (
              <KeyboardArrowDownIcon id='downIcon' />
            ) : (
              `Points: ${formatLargeNumber(currentUser?.points ?? 0)}`
            )}
          </>
        ) : (
          <>
            <img
              src={icons.airdrop}
              style={{
                marginRight: '6px',
                height: '13px',
                width: '9px'
              }}
            />
            Points
          </>
        )}
      </Button>
      <YourPointsModal open={openNetworks} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}
