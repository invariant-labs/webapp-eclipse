import { makeStyles } from '@material-ui/core'
import { colors, typography } from '@static/theme'

const useStyles = makeStyles(() => ({
  background: {
    background: colors.invariant.black,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 51,
    opacity: 0.7
  },
  container: {
    width: 480,
    padding: 32,
    borderRadius: 24,
    background: colors.invariant.component,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 52
  },
  title: {
    fontSize: 72,
    lineHeight: '72px',
    color: colors.invariant.pink,
    letterSpacing: '-0.12rem'
  },
  lowerTitle: {
    color: colors.white.main,
    letterSpacing: '-0.06rem',
    ...typography.heading1
  },
  description: {
    fontSize: 20,
    lineHeight: '28px',
    color: colors.invariant.textGrey,
    letterSpacing: '-0.03rem',
    fontWeight: 400,
    textAlign: 'center'
  },
  button: {
    width: 480,
    height: 40,
    background: colors.invariant.greenLinearGradient,
    color: colors.invariant.dark,
    borderRadius: 12,
    textTransform: 'none',
    letterSpacing: '-0.03rem',
    ...typography.body1,

    '&:hover': {
      background: colors.invariant.greenLinearGradientOpacity
    }
  },
  transparentButton: {
    width: 480,
    backgroundColor: 'transparent',
    color: colors.invariant.textGrey,
    borderRadius: 12,
    textTransform: 'none',
    letterSpacing: '-0.03rem',
    textDecoration: 'underline',
    ...typography.caption2,

    '&:hover': {
      backgroundColor: 'transparent',
      textDecoration: 'underline',
      color: colors.white.main
    }
  }
}))

export default useStyles
