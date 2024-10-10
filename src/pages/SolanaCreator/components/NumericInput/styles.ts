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
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  headerTitle: {
    ...typography.heading4,
    color: colors.invariant.text,
    marginBottom: theme.spacing(1.2)
  },
  input: {
    padding: '11px 12px',
    width: '100%',
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
    '&::placeholder': {
      color: colors.invariant.textGrey
    },
    '&:focus': {
      color: colors.white.main
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
    minHeight: '40px', // Increased to accommodate multi-line error messages
    display: 'flex',
    maxWidth: '90%',
    alignItems: 'flex-start',
    marginTop: '4px'
  },
  errorMessage: {
    color: colors.red.main,
    fontSize: '14px',
    lineHeight: '1.2'
  }
}))

export default useStyles
