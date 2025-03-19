import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    gap: 6,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    [theme.breakpoints.up(432)]: {
      flexDirection: 'row'
    }
  },
  statContainer: {
    background: colors.invariant.newDark,
    padding: '6px 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12
  },
  statName: {
    ...typography.body2,
    color: colors.invariant.textGrey
  },
  statValue: {
    ...typography.body1,
    color: colors.white.main
  },
  statContainerHiglighted: {
    background: colors.invariant.light
  },
  statValueHiglighted: {
    color: colors.invariant.green
  }
}))
