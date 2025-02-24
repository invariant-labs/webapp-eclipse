import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    claimFaucetButton: {
      height: 28,
      width: '100%',
      background: colors.invariant.green,
      borderRadius: 10,
      color: colors.invariant.dark,
      ...typography.body2,
      textTransform: 'none',

      '&:hover': {
        background: colors.invariant.green
      }
    },
    buttonIcon: {
      width: 24,
      height: 24
    }
  }
})
