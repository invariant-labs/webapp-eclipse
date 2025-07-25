import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    button: {
      minWidth: 67,
      backgroundColor: 'transparent',
      color: colors.invariant.light,
      height: 32,
      borderRadius: 10,
      ...typography.body1,
      textTransform: 'capitalize',
      boxShadow: 'none',
      margin: '4px',
      transition: '300ms',
      '&:hover': {
        background: 'transparent',
        color: colors.invariant.lightGrey,
        ...typography.body1,
        '@media (hover: none)': {
          color: colors.invariant.light
        }
      }
      // // Note: this is added only due to new presale card for desktop navigation 1260-1200 px
      // [theme.breakpoints.down(1260)]: {
      //   padding: '6px 10px'
      // }
    },
    active: {
      background: colors.invariant.light,
      color: colors.white.main,
      ...typography.body1,
      '&:hover': {
        background: colors.invariant.light,
        color: colors.white.main
      }
    },
    disabled: {
      opacity: 1
    }
  }
})

export default useStyles
