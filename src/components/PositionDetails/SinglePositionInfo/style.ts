import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    height: '100%',
    background: colors.invariant.component,
    padding: 24,
    paddingInline: 8,
    borderRadius: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 20,

    [theme.breakpoints.up(1040)]: {
      gap: 0,
      paddingInline: 24
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
  liquidityButtons: {
    display: 'flex',
    gap: 8
  },
  liquidityButton: {
    borderRadius: 10,
    height: 36,
    minWidth: 0,
    width: 36,
    margin: 0,
    padding: 0,
    color: colors.invariant.green,
    border: `2px solid ${colors.invariant.green}`,
    textTransform: 'none',
    ...typography.body1,

    '&:hover': {
      background: colors.invariant.green,
      color: colors.invariant.component
    }
  },
  liquidityButtonDisabled: {
    background: colors.invariant.light,
    borderColor: colors.invariant.light,

    '&.Mui-disabled': {
      color: colors.invariant.component
    }
  },
  liquidityButtonIcon: {
    height: 32,
    minWidth: 32
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
