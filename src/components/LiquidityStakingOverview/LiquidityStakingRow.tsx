import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Grid, Typography } from '@mui/material'
import { infoIcon } from '@static/icons'
import useStyles from './style'
import { colors } from '@static/theme'

export interface IRowProps {
  title: string
  tooltipTitle: string
  displayValue: string
  highlight?: boolean
}

export const LiquidityStakingRow: React.FC<IRowProps> = ({
  title,
  tooltipTitle,
  displayValue,
  highlight
}) => {
  const { classes } = useStyles()
  return (
    <Grid className={classes.rowWrapper}>
      <Grid className={classes.tooltipWrapper}>
        <Typography component='h1'>{title}</Typography>
        <TooltipHover title={tooltipTitle}>
          <img src={infoIcon} />
        </TooltipHover>
      </Grid>
      <Typography color={highlight ? colors.invariant.green : colors.invariant.text} component='h2'>
        {displayValue}
      </Typography>
    </Grid>
  )
}
