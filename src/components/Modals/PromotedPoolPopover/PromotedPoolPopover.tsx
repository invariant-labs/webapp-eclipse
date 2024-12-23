import { BN } from '@coral-xyz/anchor'
import useStyles from './style'
import { Popover, Typography } from '@mui/material'
import { formatNumberWithCommas, printBN } from '@utils/utils'

export interface IPromotedPoolPopover {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  apr: number
  apy: number
  points: BN
}

export const PromotedPoolPopover = ({
  open,
  onClose,
  anchorEl,
  apr,
  apy,
  points
}: IPromotedPoolPopover) => {
  const { classes } = useStyles()

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
      <div className={classes.root}>
        <div className={classes.container}>
          <Typography className={classes.greyText}>This pool distribute points: </Typography>
          <div className={classes.insideBox}>
            <Typography className={classes.greyText}>Points per 24H</Typography>
            <Typography className={classes.whiteText}>
              {formatNumberWithCommas(printBN(points, 0))}
            </Typography>
          </div>
          <div className={classes.insideBox}>
            <Typography className={classes.greyText}>
              APY
              <span className={classes.apr}>APR</span>
            </Typography>{' '}
            <Typography className={classes.whiteText}>
              {`${apy > 1000 ? '>1000%' : apy === 0 ? '' : apy.toFixed(2) + '%'}`}
              <span className={classes.apr}>
                {`${apr > 1000 ? '>1000%' : apr === 0 ? '-' : apr.toFixed(2) + '%'}`}
              </span>
            </Typography>
          </div>
        </div>
      </div>
    </Popover>
  )
}

export default PromotedPoolPopover
