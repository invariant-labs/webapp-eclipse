import { makeStyles } from '@material-ui/core'
import { colors, typography } from '@static/theme'

const useStyles = makeStyles(() => ({
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
  headerTitle: {
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '24px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '-0.03em',
    color: colors.invariant.text
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '150px'
  },
  errorMessage: {
    color: colors.red.main,
    fontSize: '14px',
    marginTop: '4px',
    minHeight: '20px'
  }
}))

export default useStyles
