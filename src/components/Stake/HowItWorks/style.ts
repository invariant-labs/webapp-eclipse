import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    width: '100%',
    maxWidth: 1072,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBlock: 72
  },
  title: {
    ...typography.heading1,
    color: colors.white.main,
    textAlign: 'center'
  },
  innerContainer: {
    backgroundColor: colors.invariant.component,
    padding: 24,
    borderRadius: 24,
    display: 'flex',
    gap: 24,

    [theme.breakpoints.down(1072)]: {
      flexDirection: 'column'
    }
  },
  image: {
    borderRadius: 24,
    objectFit: 'cover'
  },
  stepsContainer: {
    width: 350,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    gap: 24,

    [theme.breakpoints.down(1072)]: {
      width: '100%'
    }
  }
}))

export default useStyles
