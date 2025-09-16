import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    marginTop: 24,
    display: 'flex',
    gap: 20,
    height: 184,
    borderRadius: 24,
    boxSizing: 'border-box',
    maxWidth: 1040,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      height: 'auto',
      maxWidth: 510,
      width: '100%'
    }
  },
  leftBannerWrapper: {
    display: 'flex',
    boxSizing: 'border-box',
    borderRadius: 24,
    maxWidth: 765,
    width: '100%',
    background: colors.invariant.component,
    [theme.breakpoints.down('md')]: {
      height: 368,
      flexDirection: 'column'
    }
  },
  rightBannerWapper: {
    display: 'flex',
    maxWidth: 285,
    width: '100%',
    height: 184,
    alignItems: 'center',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: 24,
    borderRadius: 24,
    justifyContent: 'space-between',
    background: colors.invariant.component,
    [theme.breakpoints.down('md')]: {
      maxWidth: 510
    },
    '& h5': {
      ...typography.body2,
      color: colors.invariant.textGrey
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
