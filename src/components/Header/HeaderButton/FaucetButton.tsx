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
import classNames from 'classnames'
import { typography, colors } from '@static/theme'

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
      <TooltipHover title={getTooltipText()} top={50}>
        <div>
          <Button
            className={classNames(classes.headerButton, { [classes.disabled]: isDisabled })}
            variant='contained'
            onClick={isDisabled ? () => {} : handleClick}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%'
              }}>
              <Box style={{ color: colors.invariant.text, lineHeight: '12px', textAlign: 'left' }}>
                {children}
              </Box>
              <Typography
                style={{
                  color: colors.invariant.textGrey,
                  ...typography.caption4,
                  marginTop: '4px',
                  textAlign: 'left'
                }}>
                Get tokens
              </Typography>
            </Box>
          </Button>
        </div>
      </TooltipHover>
      <Faucet open={openFaucet} onFaucet={onFaucet} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}

export default FaucetButton
