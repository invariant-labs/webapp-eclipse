import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      height: 'auto',
      gap: 16
    }
  },
  valueWrapper: {
    display: 'flex',
    gap: 8,
    '& h3': {
      ...typography.heading1,
      color: colors.invariant.text
    }
  }
}))

export default useStyles
