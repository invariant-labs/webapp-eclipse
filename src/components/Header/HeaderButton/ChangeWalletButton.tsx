import React from 'react'
import useStyles from './style'
import classNames from 'classnames'
import { Button, Typography } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import ConnectWallet from '@components/Modals/ConnectWallet/ConnectWallet'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SelectWalletModal from '@components/Modals/SelectWalletModal/SelectWalletModal'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { leaderboardSelectors } from '@store/selectors/leaderboard'

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
  isSwap?: boolean
}
export const ChangeWalletButton: React.FC<IProps> = ({
  name,
  onConnect,
  connected,
  startIcon,
  hideArrow,
  onDisconnect,
  isDisabled = false,
  className,
  onCopyAddress = () => {},
  textClassName,
  isSwap
}) => {
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)
  const [isOpenSelectWallet, setIsOpenSelectWallet] = React.useState<boolean>(false)
  const [isChangeWallet, setIsChangeWallet] = React.useState<boolean>(false)

  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)

  // if (isDisabled) return
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
    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
    dispatch(actions.resetCurrentUser())
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
        id='connect-wallet-button'
        className={classNames(
          connected ? classes.headerButtonConnected : classes.headerButtonConnect,
          isDisabled && classes.disabled,
          className,
          isSwap && classes.swapChangeWallet
        )}
        variant={'contained'}
        disabled={isDisabled}
        classes={{
          disabled: classes.disabled,
          startIcon: classes.startIcon,
          endIcon: classes.innerEndIcon
        }}
        sx={{ '& .MuiButton-label': classes.label }}
        onClick={handleClick}
        startIcon={startIcon}
        endIcon={
          connected && !hideArrow ? <ExpandMoreIcon className={classes.endIcon} /> : undefined
        }>
        <Typography className={classNames(classes.headerButtonTextEllipsis, textClassName)}>
          {name}
        </Typography>
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
