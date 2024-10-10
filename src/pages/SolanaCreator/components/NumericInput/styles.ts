import { makeStyles, Theme } from '@material-ui/core'
import { colors, typography } from '@static/theme'
const useStyles = makeStyles((theme: Theme) => ({
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '90px'
  },
  inputContainer: {
    height: '70px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    transition: 'height 0.3s ease-in-out',

    '&.error': {
      height: '90px'
    }
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
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out',
    '&::placeholder': {
      color: colors.invariant.textGrey
    },
    '&:focus': {
      color: colors.white.main
    },
    '&.error': {
      transform: 'translateY(-3px)'
    }
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
    minHeight: '40px',
    display: 'flex',
    maxWidth: '90%',
    alignItems: 'flex-start'
  },
  errorMessage: {
    color: colors.invariant.Error,
    fontSize: 12,
    marginTop: 4,

    transform: 'translateY(100%)',
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',

    '&.visible': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

export default useStyles
