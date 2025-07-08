import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ itemWidth?: number }>()((_theme, { itemWidth }) => {
  return {
    switch: {
      height: 32,
      borderRadius: 10,
      background: colors.invariant.newDark,
      display: 'flex'
    },
    button: {
      borderRadius: 10,
      color: colors.invariant.textGrey,
      ...typography.body2,
      textTransform: 'none',
      padding: '6px 11px',
      width: itemWidth || 'auto',
      '&:hover': {
        background: colors.invariant.light
      }
    },
    buttonActive: {
      background: colors.invariant.light,
      color: colors.invariant.text,
      ...typography.body1,
      textTransform: 'none'
    }
  }
})
