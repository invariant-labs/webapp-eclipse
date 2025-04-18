import { Box } from '@mui/material'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { lockIcon2, unlockIcon } from '@static/icons'

import { Button } from '@common/Button/Button'

type Props = {
  isLocked: boolean
  onLockClick: () => void
  isPreview: boolean
}

export const LockButton = ({ isLocked, onLockClick, isPreview }: Props) => {
  if (isPreview) {
    return (
      <TooltipHover title={isPreview ? "Can't lock liquidity in preview" : 'Lock liquidity'}>
        <Box>
          <Button width={45} scheme='pink' disabled onClick={() => {}}>
            <img src={lockIcon2} alt='Lock' />
          </Button>
        </Box>
      </TooltipHover>
    )
  }
  if (!isLocked) {
    return (
      <TooltipHover title='Lock liquidity'>
        <Button scheme='pink' disabled={isLocked} variant='contained' onClick={onLockClick}>
          <img src={lockIcon2} alt='Lock' />
        </Button>
      </TooltipHover>
    )
  } else {
    return (
      <TooltipHover title='Unlocking liquidity is forbidden'>
        <Button scheme='normal' disabled variant='contained' onClick={() => {}} width={46}>
          <img src={unlockIcon} alt='Unlock' />
        </Button>
      </TooltipHover>
    )
  }
}
