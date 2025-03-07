import React from 'react'
import { blurContent, formatLargeNumber, unblurContent } from '@utils/uiUtils'
import { useMediaQuery } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import YourPointsModal from '@components/Modals/YourPointsModal/YourPointsModals'
import { theme } from '@static/theme'
import { useSelector } from 'react-redux'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { printBN, trimZeros } from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { network } from '@store/selectors/solanaConnection'
import { LEADERBOARD_DECIMAL, NetworkType } from '@store/consts/static'
import { Button } from '@common/Button/Button'

export interface IProps {
  disabled?: boolean
}
export const YourPointsButton: React.FC<IProps> = ({ disabled = false }) => {
  const isXs = useMediaQuery(theme.breakpoints.down(450))
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [openNetworks, setOpenNetworks] = React.useState<boolean>(false)
  const currentUser = useSelector(leaderboardSelectors.currentUser)
  const currentNetwork = useSelector(network)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setOpenNetworks(true)
  }

  const handleClose = () => {
    unblurContent()
    setOpenNetworks(false)
  }

  return (
    <>
      <Button
        scheme='rainbow'
        disabled={disabled}
        padding={isXs ? `0 2px` : undefined}
        onClick={handleClick}>
        <>
          {isXs ? (
            <KeyboardArrowDownIcon id='downIcon' />
          ) : currentNetwork === NetworkType.Mainnet ? (
            `Points: ${trimZeros(formatLargeNumber(+printBN(new BN(currentUser.total?.points, 'hex'), LEADERBOARD_DECIMAL))) ?? 0}`
          ) : (
            'Points'
          )}
        </>
      </Button>
      <YourPointsModal open={openNetworks} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}
