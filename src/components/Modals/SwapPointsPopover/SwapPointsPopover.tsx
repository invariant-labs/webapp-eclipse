import useStyles from './style'
import { Popover, Typography, Box } from '@mui/material'
import { colors } from '@static/theme'
import { NetworkType } from '@store/consts/static'
import { addressToTicker } from '@utils/utils'
import { useState, useEffect } from 'react'

export interface ISwapPointsPopover {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  network: NetworkType
  promotedSwapPairs: { tokenX: string; tokenY: string }[]
}

export const SwapPointsPopover = ({
  open,
  anchorEl,
  onClose,
  network,
  promotedSwapPairs
}: ISwapPointsPopover) => {
  const { classes } = useStyles()
  const [animationTriggered, setAnimationTriggered] = useState(false)

  useEffect(() => {
    if (open && !animationTriggered) {
      const ANIM_TIME = 500

      const timer = setTimeout(() => {
        setAnimationTriggered(true)
      }, ANIM_TIME)

      return () => clearTimeout(timer)
    }
  }, [open])

  if (!anchorEl) return null

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{
        paper: classes.paper,
        root: classes.popover
      }}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      disableRestoreFocus
      slotProps={{
        paper: {
          onMouseLeave: onClose
        }
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      marginThreshold={16}>
      <div className={classes.backgroundContainer}>
        <div className={classes.explanationContainer}>
          <Typography className={classes.sectionTitle}>
            Estimated points for completing this swap.{' '}
          </Typography>
          <Typography className={classes.standardText}>
            The number of points you will receive depends on the fees your swap generates for
            liquidity providers.
          </Typography>
          <Typography className={classes.sectionTitle}>Why not base it on volume?</Typography>
          <Typography className={classes.standardText}>
            Because we want to avoid artificially inflating volume on highly correlated pairs. Our
            goal is for the volume on Invariant to reflect genuine activity from normal swaps, not
            artificial transactions. We are committed to discouraging wash trading.
          </Typography>
        </div>
        <Box
          sx={{
            width: '2px',
            backgroundColor: colors.invariant.light,
            alignSelf: 'stretch'
          }}
        />
        <div className={classes.promotedSwapsContainer}>
          <Typography className={classes.standardText}>
            Currently, swaps on the following pairs distribute points (all fee tiers):
          </Typography>
          <Box display={'flex'} gap={'4px'} flexDirection={'column'} padding={'4px'}>
            {promotedSwapPairs.map(item => (
              <Typography className={classes.listText}>
                {' '}
                • {addressToTicker(network, item.tokenX.toString())}/
                {addressToTicker(network, item.tokenY.toString())}
              </Typography>
            ))}
          </Box>
        </div>
      </div>
    </Popover>
  )
}

export default SwapPointsPopover
