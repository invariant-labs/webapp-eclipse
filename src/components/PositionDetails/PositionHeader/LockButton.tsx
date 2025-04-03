import { Box, Button as MuiButton } from '@mui/material'
import { useStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import icons from '@static/icons'

import { Button } from '@common/Button/Button'

type Props = {
  isLocked: boolean
  onLockClick: () => void
  isPreview: boolean
}

export const LockButton = ({ isLocked, onLockClick, isPreview }: Props) => {
  const { classes } = useStyles()

  if (isPreview) {
    return (
      <TooltipHover title={isPreview ? "Can't lock liquidity in preview" : 'Lock liquidity'}>
        <Box>
          <Button width={45} scheme='green' disabled onClick={() => {}}>
            <img src={icons.lock} alt='Lock' />
          </Button>
        </Box>
      </TooltipHover>
    )
  }
  if (!isLocked) {
    return (
      <TooltipHover title='Lock liquidity'>
        <MuiButton
          className={classes.lockButton}
          disabled={isLocked}
          variant='contained'
          onClick={onLockClick}>
          <img src={icons.lock} alt='Lock' />
        </MuiButton>
      </TooltipHover>
    )
  } else {
    return (
      <TooltipHover title='Unlocking liquidity is forbidden'>
        <MuiButton disabled className={classes.lockButton} variant='contained' onClick={() => {}}>
          <img src={icons.unlock} alt='Unlock' />
        </MuiButton>
      </TooltipHover>
    )
  }
}
