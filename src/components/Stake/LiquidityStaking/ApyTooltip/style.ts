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
    alignItems: 'center',
    backgroundColor: colors.invariant.newDark,
    padding: '5px 8px',
    gap: 4,
    borderRadius: 8
  },
  valueWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2px 4px',
    margin: 0
  },
  value: {
    display: 'flex',
    alignItems: 'center'
  },
  greenValue: {
    color: colors.invariant.green,
    ...typography.caption1
  },
  crossedValue: {
    color: colors.invariant.textGrey,
    textDecoration: 'line-through',
    ...typography.caption4
  },
  arrow: {
    color: colors.invariant.textGrey,
    ...typography.body2
  },
  skeleton: {
    height: 34,
    opacity: 0.7,
    borderRadius: 8
  }
}))

export default useStyles
