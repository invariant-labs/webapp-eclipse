import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
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
    subheaderWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(2)
    },
    container: {
      width: 544,
      borderRadius: 24,
      background: colors.invariant.component,
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
    },
    eclipseIcon: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: -1,
      opacity: 0.1
    },
    gradient: {
      borderRadius: 24,
      padding: 32,
      background:
        'radial-gradient(circle at top, rgba(239, 132, 245, 0.25), rgba(239, 132, 245, 0)), radial-gradient(circle at bottom, rgba(46, 224, 154, 0.25), rgba(46, 224, 154, 0))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 32
    }
  }
})

export default useStyles
