import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    padding: 24,
    [theme.breakpoints.down('sm')]: {
      padding: '24px 8px'
    },
    '&:nth-of-type(odd)': {
      background: `${colors.invariant.componentDark}`
    },

    '&:first-of-type': {
      padding: '12px 24px',
      background: colors.invariant.component
    },

    borderTop: `1px solid ${colors.invariant.light}`
  },
  APYLabel: {
    ...typography.body2,
    color: colors.invariant.textGrey,
    alignSelf: 'flex-end'
  },
  APRLabel: {
    ...typography.tiny2,
    color: colors.invariant.textGrey,
    alignSelf: 'flex-end',
    marginLeft: '8px'
  },
  APRValue: {
    ...typography.tiny2,
    color: colors.invariant.text,
    alignSelf: 'flex-end',
    marginLeft: '8px',
    marginBottom: '2px'
  },
  APYValue: {
    ...typography.heading4,
    color: colors.invariant.text,
    alignSelf: 'flex-end'
  },
  infoWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '24px'
  },
  container: {
    color: colors.white.main,
    display: 'grid',
    gridTemplateColumns: 'auto 60% 20%',
    whiteSpace: 'nowrap',
    maxWidth: '100%',

    '& p': {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    '& p:last-child': {
      justifyContent: 'flex-end'
    },

    [theme.breakpoints.down('md')]: {
      '& p': {
        ...typography.heading4
      }
    },
    [theme.breakpoints.down('sm')]: {
      '& p': {
        ...typography.caption1
      }
    },

    padding: 0
  },
  containerNoAPY: {
    gridTemplateColumns: '5% auto 12% 15% 12%'
  },
  tooltipIcon: {
    '&:hover': {
      cursor: 'pointer'
    }
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  iconsWrapper: {
    display: 'flex',
    height: 28
  },

  header: {
    '& p.MuiTypography-root': {
      color: colors.invariant.textGrey,
      ...typography.heading4,
      fontWeight: 600,

      [theme.breakpoints.down('sm')]: {
        ...typography.caption2,
        fontWeight: 600
      }
    }
  },

  symbolsContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 10,
    paddingRight: 5,

    '& p': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      display: 'block'
    },

    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      justifyContent: 'flex-start'
    }
  },
  icon: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4
    }
  },
  activeLiquidityIcon: {
    marginLeft: 5,
    height: 14,
    width: 14,
    border: '1px solid #FFFFFF',
    color: colors.invariant.text,
    borderRadius: '50%',
    fontSize: 10,
    lineHeight: '10px',
    fontWeight: 400,
    textAlign: 'center',
    boxSizing: 'border-box',
    paddingTop: 1,
    cursor: 'pointer'
  },
  liquidityTooltip: {
    background: colors.invariant.component,
    boxShadow: '0px 4px 18px rgba(0, 0, 0, 0.35)',
    borderRadius: 20,
    padding: 16,
    maxWidth: 350,
    boxSizing: 'border-box'
  },
  liquidityTitle: {
    color: colors.invariant.text,
    ...typography.heading4,
    marginBottom: 8
  },
  liquidityDesc: {
    color: colors.invariant.text,
    ...typography.caption1
  },
  action: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8
  },
  actionButton: {
    height: 32,
    background: 'none',
    width: 32,
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
  },
  iconContainer: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    marginRight: 3,
    position: 'relative'
  },
  tokenIcon: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    marginRight: 3,
    borderRadius: '50%'
  },
  warningIcon: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -6,
    right: -6
  },
  clipboardIcon: {
    marginLeft: 4,
    width: 18,
    cursor: 'pointer',
    color: colors.invariant.lightHover,
    '&:hover': {
      color: colors.invariant.text,

      '@media (hover: none)': {
        color: colors.invariant.lightHover
      }
    }
  },
  row: {
    display: 'flex',
    gap: 4,
    fontSize: 30,
    height: 32
  },
  apy: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: colors.invariant.textGrey
  }
}))
