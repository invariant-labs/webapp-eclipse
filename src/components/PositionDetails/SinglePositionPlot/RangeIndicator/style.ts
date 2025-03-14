import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    height: 28,
    padding: '0 12px',
    background: colors.invariant.dark,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '100%',
    background: colors.invariant.pink
  },
  dotInRange: {
    background: colors.invariant.green
  },
  text: {
    color: colors.invariant.pink
  },
  textInRange: {
    color: colors.invariant.green
  }
}))
