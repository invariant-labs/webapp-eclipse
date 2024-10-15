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
    border: '1px solid transparent',
    backgroundColor: colors.invariant.newDark,
    color: colors.invariant.lightGrey,
    borderRadius: 8,
    cursor: 'pointer',
    '&::placeholder': {
      color: colors.invariant.textGrey
    },
    '&:focus': {
      color: colors.white.main
    },
    '& textarea': {
      overflow: 'auto !important',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: colors.invariant.newDark
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: colors.invariant.lightGrey,
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: colors.invariant.textGrey
        }
      }
    }
  },
  labelContainer: {
    position: 'relative',
    display: 'inline-block'
  },
  requiredDot: {
    position: 'absolute',
    top: '35px',
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
    border: `1px solid ${colors.invariant.Error}`,
    '&:focus': {
      border: `1px solid ${colors.invariant.Error}`
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
    color: colors.invariant.text,
    marginBottom: '8px'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: 'fit-content'
  },
  inputContainer: {
    height: '80px',
    overflowY: 'auto'
  },
  errorMessage: {
    color: colors.invariant.Error,
    fontSize: '14px',
    lineHeight: '20px',
    minHeight: '20px'
  },
  errorIndicator: {
    color: colors.invariant.Error
  }
}))

export default useStyles
