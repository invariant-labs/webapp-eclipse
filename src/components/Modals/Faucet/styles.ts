import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    root: {
      background: colors.invariant.component,
      width: 310,
      borderRadius: 20,
      marginTop: 8,
      padding: 8
    },
    title: {
      ...typography.body1,
      padding: '0 10px'
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
      marginBlock: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'nowrap'
    },
    input: {
      backgroundColor: colors.invariant.newDark,
      width: '100%',
      height: 30,
      color: colors.white.main,
      borderRadius: 11,
      ...typography.body2,
      marginRight: 6,
      overflow: 'hidden',

      '&::placeholder': {
        color: colors.invariant.light,
        ...typography.body2
      },
      '&:focus': {
        outline: 'none'
      },
      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
        display: 'none'
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
      transition: 'filter 300ms',
      '&:hover': {
        filter: 'brightness(1.5)'
      }
    }
  }
})

export default useStyles
