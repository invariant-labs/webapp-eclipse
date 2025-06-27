import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  numberContainer: {
    display: 'flex',
    gap: 12
  },
  box: {
    height: 28,
    width: 2,
    backgroundColor: colors.invariant.textGrey
  },
  boxHighlighted: {
    backgroundColor: colors.invariant.pink
  },
  number: {
    ...typography.heading3,
    color: colors.white.main
  },
  content: {
    ...typography.body2,
    color: colors.invariant.textGrey
  }
}))

export default useStyles
