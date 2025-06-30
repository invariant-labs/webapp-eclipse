import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  tooltipWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexDirection: 'column'
  },
  tooltipText: {
    color: colors.invariant.textGrey,
    ...typography.caption2
  },
  greenTooltipText: {
    color: colors.invariant.green,
    ...typography.caption2
  },
  itemWrapper: {
    display: 'flex',
    gap: 4,
    alignItems: 'center'
  },
  plus: {
    color: colors.invariant.textGrey,
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '24px'
  },
  row: {
    flexWrap: 'nowrap',
    alignItems: 'center'
  },
  valueWrapper: {
    display: 'flex',
    gap: 2,
    alignItems: 'center'
  },
  greenValue: {
    color: colors.invariant.green,
    ...typography.caption2
  },
  crossedValue: {
    color: colors.invariant.textGrey,
    textDecoration: 'line-through',
    ...typography.caption2
  }
}))

export default useStyles
