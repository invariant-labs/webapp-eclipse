import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  tokenContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenLeftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  tokenValue: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  tokenAmount: {
    ...typography.heading2,
    color: colors.invariant.textGrey
  }
}))
