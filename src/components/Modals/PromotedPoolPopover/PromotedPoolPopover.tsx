import { BN } from '@coral-xyz/anchor'
import useStyles from './style'
import { Popover, Typography } from '@mui/material'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
export interface IPromotedPoolPopover {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  isActive?: boolean
  apr?: BN
  apy?: number
  estPoints?: BN
  points: BN
  headerText?: string | React.ReactNode
  pointsLabel?: string | React.ReactNode
  showEstPointsFirst?: boolean
}

export const PromotedPoolPopover = ({
  open,
  onClose,
  anchorEl,
  isActive,
  apr,
  apy,
  estPoints,
  points,
  headerText = 'The pool distributes points:',
  pointsLabel = 'Points per 24H',
  showEstPointsFirst = false
}: IPromotedPoolPopover) => {
  const { classes } = useStyles()

  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }

  if (!anchorEl) return null

  const TotalPointsSection = (
    <div className={classes.insideBox}>
      <Typography
        className={classes.greyText}
        dangerouslySetInnerHTML={
          typeof pointsLabel === 'string' ? { __html: pointsLabel } : undefined
        }>
        {typeof pointsLabel !== 'string' ? pointsLabel : null}
      </Typography>
      <Typography className={classes.whiteText}>
        {formatNumberWithCommas(printBN(points, 0))}
      </Typography>
    </div>
  )
  const EstPointsSection = estPoints ? (
    <div className={classes.insideBox}>
      <Typography className={classes.greyText}>Points earned by this position per 24H:</Typography>
      <Typography className={classes.whiteText}>
        {isLessThanMinimal(estPoints) && isActive
          ? '<0.01'
          : removeAdditionalDecimals(
              formatNumberWithCommas(printBN(estPoints, LEADERBOARD_DECIMAL)),
              2
            )}
      </Typography>
    </div>
  ) : null

  return (
    <Popover
      onClick={e => e.stopPropagation()}
      open={open}
      anchorEl={anchorEl}
      className='promoted-pool-popover'
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
          <Typography
            className={classes.greyText}
            dangerouslySetInnerHTML={
              typeof headerText === 'string' ? { __html: headerText } : undefined
            }>
            {typeof headerText !== 'string' ? headerText : null}
          </Typography>

          {showEstPointsFirst ? (
            <>
              {EstPointsSection}
              {TotalPointsSection}
            </>
          ) : (
            <>
              {TotalPointsSection}
              {EstPointsSection}
            </>
          )}

          {apr && apy ? (
            <>
              <div className={classes.insideBox}>
                <Typography className={classes.greyText}>
                  APR
                  <span className={classes.apy}>APY</span>
                </Typography>{' '}
                <Typography className={classes.whiteText}>
                  {`${apr > 1000 ? '>1000%' : apr === 0 ? '-' : Math.abs(apr).toFixed(2) + '%'}`}
                  <span className={classes.apy}>
                    {`${apy > 1000 ? '>1000%' : apy === 0 ? '' : Math.abs(apy).toFixed(2) + '%'}`}
                  </span>
                </Typography>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Popover>
  )
}

export default PromotedPoolPopover
