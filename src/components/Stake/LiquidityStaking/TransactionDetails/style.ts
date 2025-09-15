import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    wrapper: {
      backgroundColor: colors.invariant.newDark,
      borderRadius: 24,
      padding: 12
    },
    label: {
      color: colors.invariant.textGrey,
      ...typography.body1
    },
    value: {
      color: colors.invariant.green,
      ...typography.body2,
      height: 24
    }
  }
})

export default useStyles
