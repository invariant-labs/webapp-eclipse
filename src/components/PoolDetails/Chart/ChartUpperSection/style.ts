import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  upperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 71,
    flexDirection: 'row',
    [theme.breakpoints.down(1200)]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down(1200)]: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      width: '100%',
      height: 'auto'
    }
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column'
  },
  addressIcon: {
    '&:hover': {
      cursor: 'pointer'
    }
  },
  iconContainer: { display: 'flex', alignItems: 'center', gap: 3 },
  icon: {
    borderRadius: '100%',
    height: 36,
    width: 36,
    [theme.breakpoints.down(1040)]: {
      height: 28,
      width: 28
    }
  },
  reverseTokensIcon: {
    color: colors.invariant.lightGrey
  },
  tickerContainer: {
    color: colors.white.main,
    ...typography.heading3,
    [theme.breakpoints.down(1040)]: {
      ...typography.heading4
    }
  },
  actionButton: {
    height: 32,
    width: 32,
    background: 'none',
    padding: 0,
    margin: 0,
    border: 'none',
    color: colors.invariant.black,
    textTransform: 'none',
    transition: 'filter 0.3s linear',

    '&:hover': {
      filter: 'brightness(1.2)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  }
}))

export default useStyles
