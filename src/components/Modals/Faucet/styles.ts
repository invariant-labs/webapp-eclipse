import { makeStyles } from '@material-ui/core/styles'
import { colors, typography } from '@static/theme'

const useStyles = makeStyles(() => ({
  root: {
    background: colors.invariant.component,
    width: 310,
    borderRadius: 20,
    marginTop: 8,
    padding: 8
  },
  title: {
    ...typography.body1,
    margin: 10
  },
  name: {
    textTransform: 'capitalize',
    ...typography.body2,
    paddingTop: '1px'
  },
  paper: {
    background: 'transparent',
    boxShadow: 'none'
  },
  lowerRow: {
    height: 30,
    marginBlock: 10
  },
  input: {
    backgroundColor: colors.invariant.newDark,
    width: '100%',
    height: 30,
    color: colors.white.main,
    borderRadius: 11,
    ...typography.body2,
    marginRight: 6,
    '&::placeholder': {
      color: colors.invariant.light,
      ...typography.body2
    },
    '&:focus': {
      outline: 'none'
    }
  },
  innerInput: {
    padding: '6px 10px'
  },
  add: {
    minWidth: 50,
    height: 30,
    background: colors.invariant.greenLinearGradient,
    ...typography.body1,
    color: colors.invariant.black,
    textTransform: 'none',
    borderRadius: 11,

    '&:disabled': {
      background: colors.invariant.light,
      color: colors.invariant.black
    }
  },
  refreshIconBtn: {
    padding: 0,
    margin: 0,
    minWidth: 'auto',
    background: 'none',
    '& :hover': {
      background: 'none'
    }
  },
  refreshIcon: {
    width: 26,
    height: 21,
    cursor: 'pointer',
    transition: 'filter 100ms',
    '&:hover': {
      filter: 'brightness(1.5)'
    }
  }
}))

export default useStyles
