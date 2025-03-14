import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 12,
    background: colors.invariant.dark,
    borderRadius: 16
  },
  stat: {
    display: 'flex',
    gap: 4
  },
  statTitle: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  statDescription: {
    ...typography.caption1,
    color: colors.white.main
  }
}))
