import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ showInfo?: boolean }>()((_theme, { showInfo = false }) => ({
  container: {
    transition: 'all 0.3s',
    rowGap: 12,
    color: colors.white.main,
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${colors.invariant.light}`,
    overflow: 'hidden',
    flexDirection: 'row',
    height: showInfo ? 153 : 88,
    background: showInfo ? colors.invariant.darkGradient : colors.invariant.component,

    [theme.breakpoints.down('md')]: {
      padding: '12px 16px',
      // height: showInfo ? 230 : 88
      height: showInfo ? 286 : 88
    },

    [theme.breakpoints.down('sm')]: {
      padding: '12px 8px'
    }
  },

  info: {
    visibility: showInfo ? 'visible' : 'hidden',
    width: '100%'
  },
  symbolsWrapper: {
    display: 'flex',
    flexWrap: 'nowrap',
    width: 40
    // [theme.breakpoints.down('md')]: {
    //   minWidth: 40
    // },
    // [theme.breakpoints.down('sm')]: {
    //   minWidth: 50
    // }
  },
  imageWrapper: {
    position: 'relative',
    display: 'flex'
  },
  imageToWrapper: {
    position: 'relative',
    display: 'flex'
  },

  containerNoAPY: {},

  imageContainer: {
    display: 'flex',
    alignItems: 'center'
    // width: '100%',
    // paddingRight: 12,

    // '& p': {
    //   maxWidth: 'calc(100% - 80px);',

    //   paddingRight: 4,
    //   overflow: 'hidden',
    //   whiteSpace: 'nowrap',
    //   textOverflow: 'ellipsis'
    // }
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
    position: 'absolute',
    bottom: -10,
    right: -56,
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
    cursor: 'pointer',
    flexShrink: 0
  }
}))
