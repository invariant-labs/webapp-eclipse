import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    height: '100%',
    background: colors.invariant.component,
    padding: 8,
    borderRadius: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,

    [theme.breakpoints.up('sm')]: {
      padding: 24
    }
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1300,
    backgroundColor: 'transparent'
  },
  claimButton: {
    background: colors.invariant.pinkLinearGradientOpacity,
    borderRadius: 12,
    height: 36,
    width: 72,
    color: colors.invariant.dark,
    textTransform: 'none',
    ...typography.body1,

    '&:disabled': {
      pointerEvents: 'all',
      background: colors.invariant.light,
      color: colors.invariant.textGrey
    }
  }
}))

export default useStyles
