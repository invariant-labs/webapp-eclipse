import React from 'react'
import useStyles from './style'
import { Box, Typography } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import ConnectWallet from '@components/Modals/ConnectWallet/ConnectWallet'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SelectWalletModal from '@components/Modals/SelectWalletModal/SelectWalletModal'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { Button } from '@common/Button/Button'

export interface IProps {
  name: string
  onConnect: () => void
  connected: boolean
  startIcon?: JSX.Element
  onDisconnect: () => void
  hideArrow?: boolean
  className?: string
  onCopyAddress?: () => void
  textClassName?: string
  isDisabled?: boolean
  margin?: string | number
  width?: string | number
  height?: string | number
  isSwap?: boolean
}
export const ChangeWalletButton: React.FC<IProps> = ({
  name,
  onConnect,
  connected,
  height = 40,
  startIcon,
  width,
  margin,
  hideArrow,
  onDisconnect,
  isDisabled = false,
  onCopyAddress = () => {},
  textClassName
}) => {
  const { classes, cx } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)
  const [isOpenSelectWallet, setIsOpenSelectWallet] = React.useState<boolean>(false)
  const [isChangeWallet, setIsChangeWallet] = React.useState<boolean>(false)

  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!connected) {
      setIsOpenSelectWallet(true)
      setAnchorEl(event.currentTarget)
      blurContent()
    } else {
      setAnchorEl(event.currentTarget)
      blurContent()
      setOpen(true)
    }
  }

  const handleConnect = async () => {
    onConnect()
    setIsOpenSelectWallet(false)
    unblurContent()
    setIsChangeWallet(false)

    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
  }

  const handleClose = () => {
    unblurContent()
    setOpen(false)
  }

  const handleDisconnect = () => {
    onDisconnect()
    unblurContent()
    setOpen(false)
    localStorage.setItem('WALLET_TYPE', '')
    dispatch(actions.resetCurrentUser())
    dispatch(actions.resetContentPoints())
  }

  const handleChangeWallet = () => {
    setIsChangeWallet(true)
    unblurContent()
    setOpen(false)
    setIsOpenSelectWallet(true)
    blurContent()

    localStorage.setItem('WALLET_TYPE', '')
  }

  const handleCopyAddress = () => {
    onCopyAddress()
    unblurContent()
    setOpen(false)
  }

  return (
    <>
      <Button
        margin={margin}
        height={height}
        width={width}
        scheme={connected ? 'normal' : 'pink'}
        disabled={isDisabled}
        classes={{
          startIcon: classes.startIcon,
          endIcon: classes.innerEndIcon
        }}
        onClick={isDisabled ? () => {} : handleClick}>
        <Box className={classes.headerButtonContainer}>
          {startIcon && <Box className={classes.startIcon}>{startIcon}</Box>}
          <Typography className={cx(classes.headerButtonTextEllipsis, textClassName)}>
            {name}
          </Typography>
          {connected && !hideArrow && <ExpandMoreIcon className={classes.endIcon} />}
        </Box>
      </Button>
      <SelectWalletModal
        anchorEl={anchorEl}
        handleClose={() => {
          setIsOpenSelectWallet(false)
          unblurContent()
        }}
        setIsOpenSelectWallet={() => {
          setIsOpenSelectWallet(false)
          unblurContent()
        }}
        handleConnect={handleConnect}
        open={isOpenSelectWallet}
        isChangeWallet={isChangeWallet}
        onDisconnect={handleDisconnect}
      />
      <ConnectWallet
        open={open}
        anchorEl={anchorEl}
        handleClose={handleClose}
        callDisconect={handleDisconnect}
        callCopyAddress={handleCopyAddress}
        callChangeWallet={handleChangeWallet}
      />
    </>
  )
}
export default ChangeWalletButton
