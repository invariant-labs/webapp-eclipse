import React, { useEffect } from 'react'
import { unknownTokenIcon, warningIcon } from '@static/icons'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Box, Button } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SelectTokenModal from '@components/Modals/SelectModals/SelectTokenModal/SelectTokenModal'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from '@store/consts/static'

export interface ISelectModal {
  name?: string
  current: SwapToken | null
  centered?: boolean
  tokens: SwapToken[]
  onSelect?: (index: number) => void
  className?: string
  hideBalancesInModal?: boolean
  handleAddToken?: (address: string) => void
  sliceName?: boolean
  commonTokens: PublicKey[]
  initialHideUnknownTokensValue: boolean
  onHideUnknownTokensChange: (val: boolean) => void
  hiddenUnknownTokens: boolean
  network: NetworkType
  hideSelect?: boolean
  notRoundIcon?: boolean
}

export const Select: React.FC<ISelectModal> = ({
  name = 'Select',
  current,
  centered,
  tokens,
  onSelect,
  className,
  hideBalancesInModal = false,
  handleAddToken,
  sliceName = false,
  commonTokens,
  initialHideUnknownTokensValue,
  onHideUnknownTokensChange,
  hiddenUnknownTokens,
  network,
  hideSelect = false,
  notRoundIcon = false
}) => {
  const { classes, cx } = useStyles({ hideSelect, notRoundIcon })
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (hideSelect) return

    setAnchorEl(event.currentTarget)
    blurContent()
    setOpen(true)
  }

  const handleClose = () => {
    unblurContent()
    setOpen(false)
  }

  useEffect(() => {
    return () => {
      unblurContent()
    }
  }, [])

  const displayName = !current ? name : current.symbol

  return (
    <>
      <Button
        className={cx(classes.button, className)}
        color='primary'
        variant='contained'
        onClick={handleClick}
        startIcon={
          !current ? null : (
            <Box className={classes.imageContainer}>
              <img
                className={classes.icon}
                src={current.logoURI ?? unknownTokenIcon}
                alt={current.name + 'logo'}
                width='20'
                height='20'
                onError={e => {
                  e.currentTarget.src = unknownTokenIcon
                }}
              />
              {current.isUnknown && <img className={classes.warningIcon} src={warningIcon} />}
            </Box>
          )
        }
        endIcon={!hideSelect && <ExpandMoreIcon />}
        classes={{
          endIcon: 'selectArrow'
        }}
        disableRipple>
        <span style={{ whiteSpace: 'nowrap' }} className={classes.tokenName}>
          {sliceName && displayName.length > 10 ? displayName.slice(0, 8) + '...' : displayName}
        </span>
      </Button>
      <SelectTokenModal
        tokens={tokens}
        open={open}
        centered={centered}
        anchorEl={anchorEl}
        onSelect={onSelect}
        handleClose={handleClose}
        hideBalances={hideBalancesInModal}
        handleAddToken={handleAddToken}
        commonTokens={commonTokens}
        initialHideUnknownTokensValue={initialHideUnknownTokensValue}
        onHideUnknownTokensChange={onHideUnknownTokensChange}
        hiddenUnknownTokens={hiddenUnknownTokens}
        network={network}
      />
    </>
  )
}

export default Select
