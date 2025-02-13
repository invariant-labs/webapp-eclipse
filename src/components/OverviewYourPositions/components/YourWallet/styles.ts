import { makeStyles } from 'tss-react/mui'
import { colors, typography, theme } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    minWidth: '50%',
    overflowX: 'hidden'
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: colors.invariant.light,
    margin: '24px 0'
  },
  header: {
    background: colors.invariant.component,
    width: '100%',
    display: 'flex',
    padding: '16px 0px',
    [theme.breakpoints.down('lg')]: {
      borderTopLeftRadius: '24px'
    },
    borderTopLeftRadius: 0,
    borderTopRightRadius: '24px',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.invariant.light}`
  },
  headerText: {
    ...typography.heading2,
    paddingInline: '16px',
    color: colors.invariant.text
  },
  tableContainer: {
    borderBottomRightRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      borderBottomLeftRadius: '24px'
    },
    borderBottomLeftRadius: 0,
    backgroundColor: colors.invariant.component,
    height: '279px',
    overflowY: 'hidden',
    overflowX: 'hidden',

    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '4px'
    }
  },
  tableCell: {
    borderBottom: `1px solid ${colors.invariant.light}`,
    padding: '12px !important'
  },
  headerCell: {
    fontSize: '20px',
    textWrap: 'nowrap',
    fontWeight: 400,
    color: colors.invariant.textGrey,
    borderBottom: `1px solid ${colors.invariant.light}`,
    backgroundColor: colors.invariant.component,
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  tokenContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('md')]: {
      gap: '16px',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tokenIcon: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  tokenSymbol: {
    ...typography.heading4,
    color: colors.invariant.text
  },
  statsContainer: {
    backgroundColor: colors.invariant.light,
    display: 'inline-flex',
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: '4px 6px'
    },
    padding: '4px 12px',
    maxHeight: '24px',
    borderRadius: '6px',
    gap: '16px'
  },
  statsLabel: {
    ...typography.caption1,
    color: colors.invariant.textGrey
  },
  statsValue: {
    ...typography.caption1,
    color: colors.invariant.green
  },
  actionIcon: {
    height: 32,
    background: 'none',
    width: 32,
    padding: 0,
    margin: 0,
    border: 'none',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    color: colors.invariant.black,
    textTransform: 'none',
    transition: 'filter 0.2s linear',
    '&:hover': {
      filter: 'brightness(1.2)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  zebraRow: {
    '& > tr:nth-of-type(odd)': {
      background: `${colors.invariant.componentDark}`
    }
  },

  mobileActionContainer: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      borderBottom: `1px solid ${colors.invariant.light}`
    }
  },
  desktopActionCell: {
    padding: '17px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  mobileActions: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      gap: '8px'
    }
  },
  mobileContainer: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column'
    }
  },
  mobileCard: {
    backgroundColor: colors.invariant.component,
    borderRadius: '16px',
    padding: '16px',
    marginTop: '8px'
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  mobileTokenInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  mobileActionsContainer: {
    display: 'flex',
    gap: '8px'
  },
  mobileStatsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px'
  },
  mobileStatItem: {
    backgroundColor: colors.invariant.light,
    borderRadius: '10px',
    textAlign: 'center',
    width: '100%',
    minHeight: '24px'
  },
  mobileStatLabel: {
    ...typography.caption1,
    color: colors.invariant.textGrey,
    marginRight: '8px'
  },
  mobileStatValue: {
    ...typography.caption1,
    color: colors.invariant.green
  },
  desktopContainer: {
    width: '600px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
    [theme.breakpoints.down('lg')]: {
      width: 'auto'
    }
  }
}))
