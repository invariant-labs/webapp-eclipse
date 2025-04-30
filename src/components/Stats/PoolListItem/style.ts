import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ showInfo?: boolean }>()((_theme, { showInfo = false }) => ({
  wrapper: {
    maxWidth: '100%',
    '&:nth-of-type(odd)': {
      background: `${colors.invariant.component}`
    },
    '&:nth-of-type(even)': {
      background: colors.invariant.componentDark
    },
    '&:first-of-type': {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      background: colors.invariant.component,
      borderBottom: `2px solid ${colors.invariant.light}`
    }
  },

  container: {
    transition: 'all 0.3s',
    height: !showInfo ? 61 : 90,
    color: colors.white.main,
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: '30px auto 150px 120px 120px 140px 120px 150px',
    padding: '18px 24px',
    whiteSpace: 'nowrap',

    boxSizing: 'border-box',

    '& p': {
      ...typography.heading4,
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    [theme.breakpoints.up(1160)]: {
      '& p:last-child': {
        justifyContent: 'flex-end'
      }
    },

    [theme.breakpoints.down(1160)]: {
      gridTemplateColumns: 'auto 150px 100px 120px 140px 100px'
    },

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'auto 100px 140px 80px 24px'
    },

    [theme.breakpoints.down('sm')]: {
      rowGap: 12,
      gridTemplateColumns: '30% 15% 28% 17% 10%',
      padding: '18px 8px',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      }
    }
  },

  containerNoAPY: {
    gridTemplateColumns: '30px auto 120px 120px 140px 120px 150px',

    [theme.breakpoints.down(1160)]: {
      gridTemplateColumns: 'auto 100px 80px 120px'
    },

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'auto 100px 140px 80px 24px'
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'auto 60px 70px 60px 24px',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      }
    }
  },

  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingRight: 12,

    '& p': {
      maxWidth: 'calc(100% - 80px);',

      paddingRight: 12,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  },

  iconsWrapper: {
    display: 'flex',
    marginRight: 8
  },

  header: {
    height: '69px',
    '& p.MuiTypography-root': {
      display: 'flex',

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
    minWidth: 24,
    maxWidth: 24,
    height: 24,
    marginRight: 3,
    position: 'relative'
  },
  tokenIcon: {
    minWidth: 24,
    maxWidth: 24,
    height: 24,
    marginRight: 3,
    borderRadius: '50%',
    ':last-of-type': {
      marginRight: 8
    },
    [theme.breakpoints.down('sm')]: {
      ':last-of-type': {
        marginRight: 0
      }
    }
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
    alignItems: 'center',
    gap: 4,
    fontSize: 30,
    height: 32,
    [theme.breakpoints.down(850)]: {
      height: '20px'
    }
  },
  apy: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: colors.invariant.textGrey
  },
  extendedRowIcon: {
    justifySelf: 'end',
    alignSelf: 'center',
    cursor: 'pointer',
    fill: colors.invariant.green,
    transition: 'all 0.3s ease',
    transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)'
  },
  extendedRowTitle: {
    visibility: showInfo ? 'visible' : 'hidden',

    ...typography.body3,
    display: 'flex',
    flexWrap: 'nowrap',
    textWrap: 'nowrap',
    gap: 6,
    color: colors.invariant.textGrey,
    [theme.breakpoints.down('sm')]: {
      ...typography.caption1
    },
    [theme.breakpoints.up('sm')]: {
      ':last-of-type': {
        justifySelf: 'end'
      }
    }
  },
  extendedRowContent: {
    flexWrap: 'nowrap',

    ...typography.body3,
    fontWeight: 700,
    color: colors.invariant.text,
    [theme.breakpoints.down('sm')]: {
      ...typography.caption1
    }
  }
}))
