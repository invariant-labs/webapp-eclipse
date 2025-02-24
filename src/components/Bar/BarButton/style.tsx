import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    headerButton: {
      height: 32,
      paddingInline: 6,
      borderRadius: 12,
      color: colors.white.main,
      ...typography.body1,

      '&:hover': {
        background: colors.invariant.light
      }
    }
  }
})
