import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    root: {
      background: colors.invariant.light,
      width: 240,
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'column',
      gap: 10
    },
    paper: {
      background: 'transparent',
      boxShadow: 'none',
      borderRadius: '16px',
      boxSizing: 'border-box'
    },
    optionButton: {
      width: '100%',
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: colors.invariant.light,
      textDecoration: 'none',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: colors.invariant.newDark
      },
      ...typography.body2,
      color: colors.invariant.text
    },
    modalTitle: {
      ...typography.heading4,
      color: colors.invariant.text
    }
  }
})

export default useStyles
