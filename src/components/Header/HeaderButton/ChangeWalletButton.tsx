import React from 'react'
import useStyles from './style'
import { Box, Typography } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import ConnectWallet from '@components/Modals/ConnectWallet/ConnectWallet'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SelectWalletModal from '@components/Modals/SelectWalletModal/SelectWalletModal'
import { Button } from '@common/Button/Button'
// import { actions as saleActions } from '@store/reducers/archive/sale'
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
  defaultVariant?: 'green' | 'pink'
  width?: string | number
  height?: string | number
  isSwap?: boolean
  noUnblur?: boolean
}
export const ChangeWalletButton: React.FC<IProps> = ({
  name,
  onConnect,
  connected,
  height = 40,
  startIcon,
  width,
  margin,
  defaultVariant = 'pink',
  hideArrow,
  onDisconnect,
  isDisabled = false,
  onCopyAddress = () => {},
  textClassName,
  noUnblur
}) => {
  const { classes, cx } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)
  const [isOpenSelectWallet, setIsOpenSelectWallet] = React.useState<boolean>(false)
  const [isChangeWallet, setIsChangeWallet] = React.useState<boolean>(false)

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
    if (!noUnblur) {
      unblurContent()
    }
    setIsChangeWallet(false)

    // dispatch(saleActions.getUserStats())
  }

  const handleClose = () => {
    if (!noUnblur) {
      unblurContent()
    }
    setOpen(false)
  }

  const handleDisconnect = () => {
    onDisconnect()
    if (!noUnblur) {
      unblurContent()
    }
    setOpen(false)
    localStorage.setItem('WALLET_TYPE', '')
    // dispatch(saleActions.resetUserStats())
  }

  const handleChangeWallet = () => {
    setIsChangeWallet(true)
    if (!noUnblur) {
      unblurContent()
    }
    setOpen(false)
    setIsOpenSelectWallet(true)
    blurContent()

    localStorage.setItem('WALLET_TYPE', '')
  }

  const handleCopyAddress = () => {
    onCopyAddress()
    if (!noUnblur) {
      unblurContent()
    }
    setOpen(false)
  }

  return (
    <>
      <Button
        margin={margin}
        height={height}
        width={width}
        scheme={connected ? 'normal' : defaultVariant === 'pink' ? 'pink' : 'green'}
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
          if (!noUnblur) {
            unblurContent()
          }
        }}
        setIsOpenSelectWallet={() => {
          setIsOpenSelectWallet(false)
          if (!noUnblur) {
            unblurContent()
          }
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
