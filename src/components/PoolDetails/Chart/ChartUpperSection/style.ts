import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
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
    cursor: 'pointer',
    color: colors.invariant.lightGrey,
    '&:hover': {
      filter: 'brightness(1.4)',
      '@media (hover: none)': {
        filter: 'brightness(1)'
      }
    }
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
    },
    [theme.breakpoints.down('sm')]: {
      height: 28,
      width: 28
    }
  }
}))

export default useStyles
