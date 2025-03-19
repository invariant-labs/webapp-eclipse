import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    gap: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    [theme.breakpoints.up(416)]: {
      flexDirection: 'row'
    }
  },
  statContainer: {
    height: 32,
    background: colors.invariant.newDark,
    padding: '0 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12
  },
  statName: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  statValue: {
    ...typography.caption1,
    color: colors.white.main
  },
  statContainerHiglighted: {
    background: colors.invariant.light
  },
  statValueHiglighted: {
    color: colors.invariant.green
  }
}))
