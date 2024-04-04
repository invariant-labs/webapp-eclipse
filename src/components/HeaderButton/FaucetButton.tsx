import Faucet from '@components/Modals/Faucet/Faucet'
import { blurContent, unblurContent } from '@consts/uiUtils'
import { Button } from '@material-ui/core'
import React from 'react'
import useStyles from './style'

export interface IProps {
  onFaucet: () => void
  disabled?: boolean
}

export const FaucetButton: React.FC<IProps> = ({ onFaucet, disabled = false }) => {
  const classes = useStyles()
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

  return (
    <>
      <Button
        className={classes.headerButtonFaucet}
        variant='contained'
        classes={{ disabled: classes.disabled }}
        disabled={disabled}
        onClick={handleClick}>
        Faucet
      </Button>
      <Faucet open={openFaucet} onFaucet={onFaucet} anchorEl={anchorEl} handleClose={handleClose} />
    </>
  )
}

export default FaucetButton
