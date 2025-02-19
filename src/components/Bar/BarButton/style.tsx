import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    headerButton: {
      height: 40,
      paddingInline: 12,
      borderRadius: 14,
      color: colors.white.main,
      ...typography.body1,

      '&:hover': {
        background: colors.invariant.light
      }
    }
  }
})
