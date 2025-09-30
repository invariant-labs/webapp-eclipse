import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    gradient: {
      width: 'auto'
    },
    buttonContainer: {
      display: 'flex',
      backgroundColor: colors.invariant.component,
      borderRadius: 14,
      alignItems: 'center'
    },
    link: {
      textDecoration: 'none',
      color: colors.invariant.text,
      ...typography.body1,
      textTransform: 'capitalize'
    },
    claimBtn: {
      background: colors.invariant.component,
      padding: '6px 16px',
      borderRadius: 14,
      height: 40,

      '&:hover': {
        background: colors.invariant.light
      }
    }
  }
})
