import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  input: {
    ...typography.body2,
    width: '100%',
    padding: '11px 12px',
    boxSizing: 'border-box',
    fontFamily: 'Mukta',
    fontSize: 16,
    outline: 'none',
    border: '1px solid transparent',
    backgroundColor: colors.invariant.newDark,
    color: colors.invariant.lightGrey,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'color 0.3s ease, border-color 0.3s ease',

    '&::placeholder': {
      color: colors.invariant.textGrey
    },
    '&:focus': {
      color: colors.white.main,
      borderColor: colors.invariant.lightGrey
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
        transition: 'background-color 0.3s ease',
        '&:hover': {
          backgroundColor: colors.invariant.textGrey
        }
      }
    }
  },
  inputError: {
    borderColor: colors.invariant.Error,
    '&:focus': {
      borderColor: colors.invariant.Error
    }
  },
  headerTitle: {
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '24px',
    letterSpacing: '-0.03em',
    color: colors.invariant.text,
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
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
  labelContainer: {
    position: 'relative',
    display: 'inline-block'
  },
  requiredDot: {
    position: 'absolute',
    top: '35px',
    right: -5,
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: colors.invariant.Error,
    animation: '$glowing 2s infinite'
  },
  '@keyframes glowing': {
    '0%': { boxShadow: `0 0 0 0 ${colors.invariant.Error}40` },
    '70%': { boxShadow: `0 0 0 10px ${colors.invariant.Error}00` },
    '100%': { boxShadow: `0 0 0 0 ${colors.invariant.Error}00` }
  },
  errorIndicator: {
    color: colors.invariant.Error
  }
}))

export default useStyles
