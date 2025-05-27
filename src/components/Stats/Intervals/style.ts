import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    backgroundColor: colors.invariant.newDark,
    borderRadius: 8,
    boxSizing: 'border-box'
  }
}))
