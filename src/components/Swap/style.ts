import { alpha, Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  swapWrapper: {
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      padding: '0 8px'
    }
  },
  refreshIconContainer: {
    display: 'flex',
    alignItems: 'center'
  },

  leftSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    '& h1': {
      height: '27px'
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8
    }
  },
  rightSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',

    [theme.breakpoints.down('sm')]: {
      marginTop: '5px',
      flexDirection: 'column-reverse',
      alignItems: 'flex-end',
      gap: 8
    }
  },
  header: {
    maxWidth: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingBottom: 16,
    rowGap: 8,
    flexWrap: 'wrap',

    '& h1': {
      ...typography.heading4,
      color: colors.white.main
    },

    [theme.breakpoints.down('sm')]: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  },
  refreshIcon: {
    width: 26,
    height: 21,
    cursor: 'pointer',
    transition: 'filter 300ms',
    '&:hover': {
      filter: 'brightness(1.5)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  settingsIcon: {
    width: 20,
    height: 20,
    cursor: 'pointer',
    transition: 'filter 300ms',
    '&:hover': {
      filter: 'brightness(1.5)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  HiddenTransactionButton: {
    background: 'none !important',
    border: 'none',
    minWidth: 'auto',
    color: colors.invariant.lightHover,
    padding: 0,
    '&:hover': {
      filter: 'brightness(1.15)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    },
    '@media (max-width: 400px)': {
      width: '100%'
    }
  },

  transactionDetailDisabled: {
    background: 'none !important',
    border: 'none',
    minWidth: 'auto',
    padding: 0,
    color: colors.invariant.lightHover,
    '@media (max-width: 400px)': {
      width: '100%'
    }
  },

  swapControls: {
    display: 'flex',
    gap: 8,

    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-end'
    }
  },

  refreshIconBtn: {
    padding: 0,
    margin: 0,
    minWidth: 'auto',
    background: 'none',
    '&:hover': {
      background: 'none'
    },
    '&:disabled': {
      opacity: 0.5
    }
  },
  settingsIconBtn: {
    padding: 0,
    margin: 0,
    minWidth: 'auto',
    background: 'none',
    '&:hover': {
      background: 'none'
    }
  },
  slippage: {
    position: 'absolute'
  },
  tooltipRefresh: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 34,
    minWidth: 'fit-content',
    marginLeft: 8
  },
  root: {
    flexDirection: 'column',
    position: 'relative',
    maxWidth: 500,
    background: colors.invariant.component,
    borderRadius: 24,
    paddingInline: 24,
    paddingBottom: 22,
    paddingTop: 16,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: '16px 8px'
    }
  },

  tokenComponentTextContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative'
  },
  amountInput: {
    position: 'relative'
  },
  amountInputDown: {
    animation: 'slide-down 300ms linear',

    [theme.breakpoints.down('sm')]: {
      animation: 'slide-down-xs 300ms linear'
    }
  },

  amountInputUp: {
    animation: 'slide-up 300ms linear'
  },

  swapArrowBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: colors.invariant.component,
    width: 50,
    height: 50,
    borderRadius: '50%',
    position: 'absolute',
    zIndex: 2,
    left: '50%',
    top: '0%',
    transform: 'translateX(-50%) translateY(-6px)',
    cursor: 'pointer',
    transition: 'background-color 300ms'
  },
  swapImgRoot: {
    background: colors.invariant.newDark,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    transition: '300ms',
    '&:hover': {
      backgroundColor: colors.invariant.light,
      '@media (hover: none)': {
        backgroundColor: colors.invariant.newDark
      }
    }
  },

  swapArrows: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    marginBlock: 13,
    marginInline: 6,
    transition: '.3s all'
  },

  transactionDetails: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexFlow: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 12,
    cursor: 'default',
    filter: 'brightness(0.9)',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
      gap: 4
    },
    zIndex: 1
  },
  transactionDetailsInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  transactionDetailsButton: {
    [theme.breakpoints.down('sm')]: {
      flexGrow: 1
    },
    transition: '300ms'
  },
  transactionDetailsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.invariant.light,
    paddingInline: 15,
    borderRadius: '10px',
    alignItems: 'center',
    height: 34
  },

  transactionDetailsHeader: {
    ...typography.caption2,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    color: colors.invariant.lightGrey
  },

  exchangeRateWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },

    '& svg ': {
      height: 32 + '!important',
      width: 20,
      minWidth: '100%'
    }
  },
  swapButton: {
    width: '100%',
    height: 48
  },

  exchangeRoot: {
    position: 'relative',
    background: colors.invariant.newDark,
    borderRadius: 20
  },
  transactionTop: {
    marginTop: 10
  },

  hideBalance: {
    padding: '5px 15px 5px 15px'
  },

  transactionBottom: {},

  transtactionData: {
    border: `1px solid ${colors.invariant.light}`,
    borderRadius: '10px',
    padding: '5px 15px 5px 15px',
    color: colors.invariant.lightGrey
  },
  ButtonSwapActive: {
    transition: 'filter 0.3s linear',
    background: `${colors.invariant.greenLinearGradient} !important`,
    filter: 'brightness(0.8)',
    '&:hover': {
      filter: 'brightness(1.15)',
      boxShadow:
        '0px 3px 1px -2px rgba(43, 193, 144, 0.2),0px 1px 2px 0px rgba(45, 168, 128, 0.14),0px 0px 5px 7px rgba(59, 183, 142, 0.12)'
    }
  },
  infoIcon: {
    display: 'inline-block',
    width: 10,
    height: 10,
    marginLeft: 4,

    filter: 'brightness(0.8)',
    pointerEvents: 'none'
  },
  exchangeRateContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  slippageButton: {
    height: 27,
    padding: '0px 8px',
    borderRadius: 8,
    backgroundColor: colors.invariant.component,
    color: colors.invariant.textGrey,
    fontSize: 14,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'none',
    transition: '300ms',

    '&:hover': {
      background: colors.invariant.light,
      color: colors.invariant.text,
      '@media (hover: none)': {
        backgroundColor: colors.invariant.component,
        color: colors.invariant.textGrey
      }
    }
  },
  slippageAmount: {
    color: colors.invariant.green
  },
  swapLabel: {
    ...typography.caption1,
    color: colors.invariant.lightGrey,
    marginBottom: 8
  },
  unwrapContainer: {
    background: colors.invariant.component,
    color: colors.white.main,
    borderRadius: 8,
    padding: 4,
    paddingInline: 12,
    marginBottom: 16
  },
  unwrapNowButton: {
    cursor: 'pointer'
  },
  unknownWarningContainer: {
    marginTop: 12,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  unknownWarning: {
    width: '100%',
    background: alpha(colors.invariant.Error, 0.25),
    border: `1px solid ${colors.invariant.Error}`,
    ...typography.caption2,
    color: colors.invariant.Error,
    padding: 8,
    paddingInline: 8,
    borderRadius: 10
  },
  pointsBox: {
    height: 27,
    padding: '0px 8px',
    borderRadius: 8,
    backgroundColor: colors.invariant.component,
    color: colors.invariant.textGrey,
    fontSize: 16,
    fontsWeigth: 500,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'none',
    gap: 4,
    transition: 'all 0.3s ease-in-out'
  },
  pointsAmount: { color: colors.invariant.pink },
  darkGradientBackground: {
    background: 'linear-gradient(360deg, #010514 0%, #111931 100%)'
  },
  darkGradientBackgroundReverse: {
    background: 'linear-gradient(360deg, #111931 0%, #010514 100%)'
  },
  darkBackground: {
    background: colors.invariant.newDark
  },
  componentBackground: {
    background: colors.invariant.component
  },
  waveImage: {
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      width: '100%',
      position: 'absolute',
      objectFit: 'cover',
      zIndex: 0
    }
  },
  topWave: {
    width: '100%',
    position: 'absolute',
    top: 0,
    opacity: 0,
    left: 0,
    '& img': {
      borderTopLeftRadius: 24
    }
  },
  bottomWave: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    '& img': {
      borderBottomRightRadius: 24
    }
  },
  gradientBorderForContainer: {
    background: 'transparent',
    boxShadow: 'none',
    borderRadius: 24,
    border: '1px solid transparent',
    backgroundImage:
      'linear-gradient(#2A365C, #2A365C), linear-gradient(360deg, #EF84F5 0%, #2EE09A 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    transition: 'all 0.3s ease-in-out'
  },
  borderContainer: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 24,
    border: `1px solid ${colors.invariant.component}`
  },
  textShadowLabel: {
    textShadow: '3px 3px 5px #3A466B'
  },
  relative: {
    position: 'relative'
  }
}))

export default useStyles
