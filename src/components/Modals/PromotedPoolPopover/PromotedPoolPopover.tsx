import { BN } from '@coral-xyz/anchor'
import useStyles from './style'
import { Typography } from '@mui/material'
import { formatNumberWithCommas, printBN, removeAdditionalDecimals } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { QuestionMark } from '@components/Leaderboard/QuestionMark/QuestionMark'
import { convertAPYValue } from '@utils/uiUtils'
export interface IPromotedPoolPopover {
  isActive?: boolean
  apr?: BN
  apy?: number
  estPoints?: BN
  points: BN
  headerText?: string | React.ReactNode
  pointsLabel?: string | React.ReactNode
  showEstPointsFirst?: boolean
  children: React.ReactElement<any, any>
}

export const PromotedPoolPopover = ({
  isActive,
  apr,
  apy,
  estPoints,
  points,
  headerText = 'The pool distributes points:',
  pointsLabel = 'Points per 24H',
  showEstPointsFirst = false,
  children
}: IPromotedPoolPopover) => {
  const center = points.eqn(0)
  const { classes } = useStyles({ center })

  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }

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
        {points.eqn(0) ? (
          <QuestionMark marginTop={8} height={'24px'} />
        ) : (
          formatNumberWithCommas(printBN(points, 0))
        )}
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
    <TooltipHover
      title={
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
                  <span className={classes.apy}>APR</span>
                </Typography>{' '}
                <Typography className={classes.whiteText}>
                  {convertAPYValue(apy, 'APY')}
                  <span className={classes.apy}>{convertAPYValue(apr, 'APR')}</span>
                </Typography>
              </div>
            </>
          ) : null}
        </div>
      }
      placement='bottom'
      increasePadding
      gradient>
      {children}
    </TooltipHover>
  )
}

export default PromotedPoolPopover
