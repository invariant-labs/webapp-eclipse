import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    tooltipWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      flexDirection: 'column'
    },
    tooltipText: {
      color: colors.invariant.green,
      ...typography.caption2
    },
    greenTooltipText: {
      color: colors.invariant.blue,
      ...typography.caption2
    },
    crossedText: {
      textDecoration: 'line-through',
      color: colors.invariant.green,
      ...typography.caption2
    },
    greenLabel: {
      color: colors.invariant.blue,
      ...typography.caption1
    },
    itemWrapper: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    },
    plus: {
      color: colors.invariant.textGrey,
      ...typography.caption2,
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px'
    },
    apyLabel: {
      cursor: 'default',
      display: 'flex',
      alignItems: 'center',
      height: 24,
      gap: 4
    },
    greenChip: {
      ...typography.caption2,
      borderColor: colors.invariant.blue,
      color: colors.invariant.blue,
      '.MuiChip-icon': { color: colors.invariant.blue }
    },
    crossedValue: {
      color: colors.invariant.green,
      textDecoration: 'line-through'
    }
  }
})

export default useStyles
