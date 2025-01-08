import { BN } from '@coral-xyz/anchor'
import useStyles from './style'
import { Popover, Typography } from '@mui/material'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

export interface IPromotedPoolPopover {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
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
  apr,
  apy,
  estPoints,
  points,
  headerText = 'The pool distributes points:',
  pointsLabel = 'Points per 24H',
  showEstPointsFirst = false
}: IPromotedPoolPopover) => {
  const { classes } = useStyles()

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
        {removeAdditionalDecimals(
          formatNumberWithCommas(printBN(estPoints, LEADERBOARD_DECIMAL)),
          2
        )}
      </Typography>
    </div>
  ) : null

  const handlePopoverClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Popover
      onClick={handlePopoverClick}
      onTouchStart={handlePopoverClick}
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
          onMouseLeave: onClose,
          onTouchEnd: e => {
            if (!e.currentTarget.contains(e.target as Node)) {
              onClose()
            }
          },
          style: {
            touchAction: 'none'
          }
        }
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      marginThreshold={32}>
      <div className={classes.root} onClick={handlePopoverClick} onTouchStart={handlePopoverClick}>
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
            </>
          ) : null}
        </div>
      </div>
    </Popover>
  )
}

export default PromotedPoolPopover
