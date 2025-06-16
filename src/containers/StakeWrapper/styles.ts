import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    maxWidth: 1210,
    minHeight: '100%',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    ...typography.heading1,
    color: colors.white.main
  },
  subheaderDescription: {
    display: 'flex',
    gap: '4px',
    color: colors.invariant.textGrey,
    ...typography.heading4
  },
  learnMoreLink: {
    color: colors.invariant.green,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    ...typography.heading4
  },
  clipboardIcon: {
    color: colors.invariant.green
  }
}))

export default useStyles
