import { Theme } from '@mui/material'
import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  tokenContainer: {
    width: '100%',
    height: 54,
    display: 'flex',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    padding: '8px',
    '&:hover': {
      background: colors.invariant.lightHover2
    },

    [theme.breakpoints.down('sm')]: {
      height: 'auto',
      alignItems: 'flex-start'
    }
  },
  searchResultIcon: {
    width: 36,
    maxWidth: '100%',
    height: 'auto',
    marginRight: 8,
    borderRadius: '50%'
  },
  tokenLabel: {
    ...typography.heading3
  },
  tokenAddress: {
    display: 'flex',
    backgroundColor: colors.invariant.newDark,
    borderRadius: 4,
    padding: '2px 4px',
    width: 'min-content',
    height: 'min-content',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      textDecoration: 'none',

      '&:hover': {
        filter: 'brightness(1.2)',
        '@media (hover: none)': {
          filter: 'none'
        }
      },
      '& p': {
        color: colors.invariant.lightGrey,
        ...typography.caption4,
        letterSpacing: '0.03em'
      }
    }
  },
  tokenName: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  tokenBalanceStatus: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: colors.invariant.textGrey,
    '& p': {
      ...typography.body2,
      whiteSpace: 'nowrap'
    },
    '& p:last-child': {
      color: colors.invariant.text
    },

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px'
    }
  }
}))

export default useStyles
