import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  amountInput: {
    background: colors.invariant.dark,
    color: colors.white.main,
    borderRadius: 15,
    ...typography.heading4,
    width: '100%',
    height: 56,
    paddingInline: 8
  },
  input: {
    paddingTop: 4,
    '&:focus': {
      color: colors.white.main
    }
  },
  suggestedPriceText: {
    width: 148,
    fontSize: 14,
    lineHeight: 1
  }
}))

export default useStyles
