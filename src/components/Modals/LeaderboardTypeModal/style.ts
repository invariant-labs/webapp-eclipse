import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    root: {
      background: colors.invariant.component,
      width: 140,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      paddingLeft: 16,
      paddingRight: 16,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 26,
      paddingBottom: 10
    },
    paper: {
      background: 'transparent',
      boxShadow: 'none',
      borderRadius: '16px',
      boxSizing: 'border-box',
      marginTop: '-16px'
    },
    optionButton: {
      width: '100%',
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: colors.invariant.component,
      textDecoration: 'none',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: colors.invariant.component
      },
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    modalTitle: {
      ...typography.heading4,
      color: colors.invariant.text
    }
  }
})

export default useStyles
