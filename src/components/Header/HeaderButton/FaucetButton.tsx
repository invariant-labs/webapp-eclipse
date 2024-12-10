import Faucet from '@components/Modals/Faucet/Faucet'
import React from 'react'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Button } from '@mui/material'
import { BN } from '@coral-xyz/anchor'
import { WETH_MIN_FAUCET_FEE_MAIN } from '@store/consts/static'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'

export interface IProps {
  onFaucet: () => void
  disabled?: boolean
  children?: React.ReactNode
  walletBalance: BN
}

export const FaucetButton: React.FC<IProps> = ({
  onFaucet,
  disabled = false,
  walletBalance,
  children
}) => {
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [openFaucet, setOpenFaucet] = React.useState<boolean>(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setOpenFaucet(true)
  }

  const handleClose = () => {
    unblurContent()
    setOpenFaucet(false)
  }

  const isDisabled = disabled || walletBalance.lte(WETH_MIN_FAUCET_FEE_MAIN)

  return (
    <>
      <TooltipHover text={isDisabled ? "You don't have enought ETH to claim faucet" : ''} top={50}>
        <div>
          <Button
            className={classes.headerButton}
            variant='contained'
            classes={{ disabled: classes.disabled }}
            disabled={isDisabled}
            onClick={handleClick}>
            {children}
          </Button>
        </div>
      </TooltipHover>
      <Faucet open={openFaucet} onFaucet={onFaucet} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}

export default FaucetButton
