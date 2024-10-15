import { makeStyles, Theme } from '@material-ui/core'
import { colors, typography } from '@static/theme'
const useStyles = makeStyles((theme: Theme) => ({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '110px'
  },
  inputContainer: {
    height: '70px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  headerTitle: {
    ...typography.heading4,
    color: colors.invariant.text,
    marginBottom: theme.spacing(1.5)
  },
  input: {
    padding: '11px 12px',
    width: '100%',
    minHeight: '32px',
    boxSizing: 'border-box',
    ...typography.body2,
    outline: 'none',
    marginRight: -8,
    fontFamily: 'Mukta',
    outlineStyle: 'none',
    fontSize: 16,
    backgroundColor: colors.invariant.newDark,
    color: colors.invariant.lightGrey,
    border: '1px solid transparent',

    borderRadius: 8,
    cursor: 'pointer',
    '&::placeholder': {
      color: colors.invariant.textGrey
    },
    '&:focus': {
      color: colors.white.main
    }
  },
  labelContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: theme.spacing(1)
  },
  requiredDot: {
    position: 'absolute',
    top: 15,
    right: -5,
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'red',
    boxShadow: '0 0 0 rgba(255, 0, 0, 0.4)',
    animation: '$glowing 2s infinite'
  },
  '@keyframes glowing': {
    '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.4)' },
    '70%': { boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' }
  },
  inputError: {
    border: `1px solid ${colors.red.main}`,
    '&:focus': {
      border: `1px solid ${colors.red.main}`
    }
  },
  infoIcon: {
    color: colors.red.main,
    fontSize: '18px'
  },
  errorMessageContainer: {
    minHeight: '20px',
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start'
  },
  errorMessage: {
    color: colors.invariant.Error,
    fontSize: 12,
    marginTop: 4,
    width: '100%'
  }
}))

export default useStyles
