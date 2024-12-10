import React from 'react'
import useStyles from './style'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { Button, useMediaQuery } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ISelectNetwork } from '@store/consts/types'
import { NetworkType } from '@store/consts/static'
import YourPointsModal from '@components/Modals/YourPointsModal/YourPointsModals'
import { theme } from '@static/theme'

export interface IProps {
  name: NetworkType
  networks: ISelectNetwork[]
  onSelect: (networkType: NetworkType, rpcAddress: string, rpcName?: string) => void
  disabled?: boolean
}
export const YourPointsButton: React.FC<IProps> = ({
  name,
  networks,
  onSelect,
  disabled = false
}) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [openNetworks, setOpenNetworks] = React.useState<boolean>(false)

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
        className={classes.pointsHeaderButton}
        variant='contained'
        classes={{ disabled: classes.disabled }}
        disabled={disabled}
        onClick={handleClick}>
        {isSm ? <KeyboardArrowDownIcon id='downIcon' /> : 'Points: 343.3M'}
      </Button>
      <YourPointsModal
        networks={networks}
        open={openNetworks}
        anchorEl={anchorEl}
        onSelect={(networkType, rpcAddress, rpcName) => {
          onSelect(networkType, rpcAddress, rpcName)
          handleClose()
        }}
        handleClose={handleClose}
        activeNetwork={name}
      />
    </>
  )
}
