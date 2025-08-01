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
  symbolsWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    minWidth: '64px',
    [theme.breakpoints.down('md')]: {
      minWidth: 60
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: 55
    }
  },
  imageWrapper: {
    position: 'relative',
    display: 'flex'
  },
  imageToWrapper: {
    position: 'relative',
    display: 'flex'
  },
  container: {
    transition: 'all 0.3s',
    height: !showInfo ? 69 : 135,
    color: colors.white.main,
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: '70px auto 120px 190px 140px 120px 120px 150px',
    padding: '20px 26px 14px 24px',
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
      gridTemplateColumns: '40px auto 120px 190px 140px 120px 100px'
    },

    [theme.breakpoints.down('md')]: {
      height: !showInfo ? 69 : 155,

      gridTemplateColumns: '30px auto 135px 130px 90px 15px',
      rowGap: 16,
      cursor: 'pointer'
    },

    [theme.breakpoints.down('sm')]: {
      height: !showInfo ? 69 : 143,

      rowGap: 20,
      gridTemplateColumns: '30px auto 23% 29% 17% 24px',
      padding: '20px 4px 16px 8px',

      '& p': {
        justifyContent: 'flex-start',
        ...typography.caption1
      },
      '& > p:nth-of-type(5)': {
        justifyContent: 'flex-end'
      },
      '& > div:nth-of-type(6)': {
        justifyContent: 'flex-end'
      }
    }
  },

  containerNoAPY: {
    gridTemplateColumns: '70px auto 120px 140px 120px 120px 150px',

    [theme.breakpoints.down(1160)]: {
      gridTemplateColumns: '40px auto 120px 140px 120px 100px'
    },

    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '30px auto 135px 130px 90px 15px'
    },

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '30px auto 23% 29% 17% 24px'
    },

    cursor: 'pointer'
  },

  imageContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingRight: 12,

    '& p': {
      maxWidth: 'calc(100% - 80px);',

      paddingRight: 4,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    }
  },

  iconsWrapper: {
    display: 'flex',
    marginRight: 8
  },
  selfEnd: {
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end',
      textAlign: 'end'
    }
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
  extendedGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gridColumn: 'span 4',
    gap: 8
  },
  action: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 'max-content',
    gap: 8,
    [theme.breakpoints.down('md')]: {
      visibility: showInfo ? 'visible' : 'hidden',
      justifyContent: 'flex-end',
      width: 137,
      marginLeft: 7,
      gap: 3
    },
    [theme.breakpoints.down('sm')]: {
      gap: 8,
      marginLeft: 0,
      gridColumn: 'span 3',
      width: '100%',
      justifyContent: 'flex-end'
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
  },
  airdropIcon: {
    marginRight: 15,
    marginBottom: 6,
    [theme.breakpoints.down(1160)]: {
      marginRight: 25
    },

    [theme.breakpoints.down('sm')]: {
      marginRight: 6,
      marginBottom: 12
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
      marginRight: 4,
      [theme.breakpoints.down(650)]: {
        marginRight: 4
      }
    },
    [theme.breakpoints.down('sm')]: {
      ':last-of-type': {
        marginRight: 4
      }
    }
  },
  warningIcon: {
    position: 'absolute',
    width: 12,
    height: 12,
    bottom: -6,
    right: 0
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
    height: 32
  },
  apy: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: colors.invariant.textGrey
  },
  apyLabel: {
    color: colors.invariant.textGrey,
    marginTop: 4,
    marginRight: 4,
    fontSize: '15px !important'
  },
  extendedRowIcon: {
    justifySelf: 'end',
    alignSelf: 'center',
    display: 'flex',
    height: 24,
    padding: 0,
    width: 20,
    fontSize: 10,
    cursor: 'pointer',
    fill: colors.invariant.green,
    transition: 'all 0.3s ease',
    transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)'
  },

  extendedRowTitle: {
    visibility: showInfo ? 'visible' : 'hidden',

    ...typography.body3,
    display: 'flex',

    gap: 6,

    color: colors.invariant.textGrey,

    [theme.breakpoints.down('sm')]: {
      ...typography.caption1
    },
    [theme.breakpoints.up('sm')]: {
      ':last-of-type': {
        // justifySelf: 'end'
      }
    }
  },

  extendedRowContent: {
    ...typography.body3,
    fontWeight: 700,
    color: colors.invariant.text,
    [theme.breakpoints.down('sm')]: {
      ...typography.caption1
    }
  },

  tokenIndexContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  tokenIndex: {
    width: 32
  },

  favouriteButton: {
    cursor: 'pointer'
  }
}))
