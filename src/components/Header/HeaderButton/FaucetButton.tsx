import Faucet from '@components/Modals/Faucet/Faucet'
import React from 'react'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Box, Button, Typography } from '@mui/material'
import { BN } from '@coral-xyz/anchor'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import {
  NetworkType,
  WETH_MIN_FAUCET_FEE_MAIN,
  WETH_MIN_FAUCET_FEE_TEST
} from '@store/consts/static'

export interface IProps {
  onFaucet: () => void
  disabled?: boolean
  children?: React.ReactNode
  network: NetworkType
  walletBalance: BN | null
}

export const FaucetButton: React.FC<IProps> = ({
  onFaucet,
  disabled = false,
  children,
  network,
  walletBalance
}) => {
  const { classes, cx } = useStyles()
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

  const isDisabled =
    disabled ||
    walletBalance === null ||
    walletBalance.lte(
      network === NetworkType.Mainnet ? WETH_MIN_FAUCET_FEE_MAIN : WETH_MIN_FAUCET_FEE_TEST
    )

  const getTooltipText = () => {
    if (walletBalance === null) {
      return 'Please connect wallet to claim faucet'
    }
    if (
      walletBalance !== null &&
      walletBalance.lte(
        network === NetworkType.Mainnet ? WETH_MIN_FAUCET_FEE_MAIN : WETH_MIN_FAUCET_FEE_TEST
      )
    ) {
      return "You don't have enough ETH to claim faucet"
    }

    return ''
  }

  return (
    <>
      <TooltipHover title={getTooltipText()} placement='bottom'>
        <div>
          <Button
            className={cx(classes.headerButton, { [classes.disabled]: isDisabled })}
            variant='contained'
            onClick={isDisabled ? () => {} : handleClick}>
            <Box className={classes.wrapper}>
              <Box className={classes.childrenWrapper}>{children}</Box>
              <Typography className={classes.buttonLabel}>Get tokens</Typography>
            </Box>
          </Button>
        </div>
      </TooltipHover>
      <Faucet open={openFaucet} onFaucet={onFaucet} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}

export default FaucetButton
