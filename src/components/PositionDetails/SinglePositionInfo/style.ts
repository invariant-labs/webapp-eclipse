import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    background: colors.invariant.component,
    padding: 24,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  claimButton: {
    background: colors.invariant.pinkLinearGradientOpacity,
    borderRadius: 12,
    height: 36,
    width: 72,
    color: colors.invariant.dark,
    textTransform: 'none',
    ...typography.body1
  }
}))

export default useStyles
