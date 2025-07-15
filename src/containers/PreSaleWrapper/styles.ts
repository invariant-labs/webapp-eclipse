import { alpha } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    paddingInline: 40,
    [theme.breakpoints.down('sm')]: {
      paddingInline: 8
    }
  },
  contentWrapper: {
    padding: 24,
    width: '100%',
    minHeight: 445,
    display: 'flex',
    position: 'relative',
    zIndex: 5,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'flex-end',
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, #111931 29.21%, #111931 71%, rgba(17, 25, 49, 0.1) 100%);',
    boxSizing: 'border-box',
    gap: 36,
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column-reverse',
      padding: 0
    },
    [theme.breakpoints.down('md')]: {
      minHeight: 'auto'
    }
  },
  stepperContainer: {
    display: 'flex',
    minWidth: '440px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 51,
    [theme.breakpoints.down('lg')]: {
      minWidth: 'auto',
      marginRight: 0,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center'
    }
  },
  roundComponentContainer: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      background: colors.invariant.component,
      marginLeft: 0,
      marginTop: '24px',
      borderRadius: 24,
      padding: '24px 16px',
      width: 'calc(100% - 32px)'
    },
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 16px)',
      padding: '24px 8px'
    }
  },
  animatedCardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    gap: 24,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  animatedCardItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    flex: '0 1 calc(50% - 12px)',
    maxWidth: 'calc(50% - 12px)',

    [theme.breakpoints.down('md')]: {
      flex: '0 1 100%',
      maxWidth: '100%'
    }
  },
  animatedCardItemWide: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    flex: '0 1 100%',
    maxWidth: '100%',

    [theme.breakpoints.down('md')]: {
      flex: '0 1 100%',
      maxWidth: '100%'
    }
  },
  slider: {
    '& .slick-slide': {
      display: 'flex',
      justifyContent: 'center'
    },
    '& .slick-arrow': {
      height: '40px',
      overflow: 'hidden'
    },
    '& .slick-arrow::before': {
      fontSize: '40px',
      opacity: 0,
      '&:hover': {
        boxShadow: '0 0 0 4px rgba(80, 207, 61, 1)'
      },
      color: colors.invariant.textGrey,
      transition: 'color 0.3s ease'
    },

    '& .slick-list': {
      padding: '0 16px',
      [theme.breakpoints.down('sm')]: {
        padding: 0
      }
    },
    '& .slick-track': {
      [theme.breakpoints.down('sm')]: {
        margin: '0 auto'
      }
    }
  },
  cardsContainer: {
    width: '100%',
    display: 'flex',
    flexWrap: 'nowrap'
  },
  dots: {
    position: 'absolute',
    bottom: -40,
    '& li': {
      borderRadius: '50%',
      height: 12,
      width: 12,
      margin: '0 8px',
      border: `2px solid transparent`,
      transition: 'all 0.3s ease',
      position: 'relative',
      '&.slick-active': {
        background: colors.invariant.component,
        border: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: '50%',
          background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
          zIndex: -1
        }
      },
      '&': {
        background: colors.invariant.component,
        border: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: '50%',
          background: alpha(colors.invariant.lightGrey, 0.3),
          zIndex: -1
        }
      },
      '& button': {
        opacity: 0,
        height: '100%',
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        cursor: 'pointer'
      },
      '& button::before': {
        content: '""'
      }
    }
  },
  reverseContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  arrowIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '12px',
    height: 40,
    padding: '8px 12px',
    borderRadius: '12px',
    background: colors.invariant.component,
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    border: '1px solid transparent',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    [theme.breakpoints.down('lg')]: {
      background: colors.invariant.bodyBackground
    },
    [theme.breakpoints.down('sm')]: {
      height: 36,
      padding: '6px 10px',
      borderRadius: '8px'
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, rgba(80, 207, 61, 0.1), rgba(80, 207, 61, 0))',
      transform: 'translateX(-100%)',
      transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      zIndex: 0
    },
    '@media (hover: hover)': {
      '&:hover': {
        cursor: 'pointer',
        borderColor: colors.invariant.green,
        boxShadow: `0 2px 15px ${alpha(colors.invariant.green, 0.2)}`,
        '&:before': {
          transform: 'translateX(0)'
        },
        '& img': {
          transform: 'translateX(160px) rotate(180deg)',

          filter: 'brightness(1.2)'
        },
        '& .reverseText': {
          opacity: 1,
          transform: 'translateX(0)'
        }
      }
    },
    '&:active': {
      [theme.breakpoints.down('md')]: {
        borderColor: colors.invariant.green,
        boxShadow: `0 2px 15px ${alpha(colors.invariant.green, 0.2)}`,
        '&:before': {
          transform: 'translateX(0)'
        },
        '& img': {
          transform: 'translateX(50%) rotate(180deg)',
          filter: 'brightness(1.2)'
        },
        '& .reverseText': {
          opacity: 1,
          transform: 'translateX(0)'
        }
      }
    },
    '& img': {
      width: 24,
      height: 24,
      transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
      position: 'relative',
      zIndex: 1,
      filter: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))',
      [theme.breakpoints.down('sm')]: {
        width: 20,
        height: 20
      }
    }
  },
  reverseText: {
    position: 'absolute',
    left: 12,
    color: colors.invariant.text,
    opacity: 0,
    transform: 'translateX(-100%)',
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    zIndex: 1,
    [theme.breakpoints.down('sm')]: {
      fontSize: '12px',
      left: 10
    }
  },
  sliderItem: {
    width: 64,
    height: 64,
    borderRadius: '6px'
  },
  sectionTitle: {
    zIndex: 90,
    marginTop: 72,
    width: '100%',
    maxWidth: 1210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 24,
    boxSizing: 'border-box'
  },
  sectionTokenomics: {
    zIndex: 90,
    marginTop: 72,
    width: '100%',
    maxWidth: 1210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 24,
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      marginTop: 48
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 88
    }
  },
  dexChartContainer: {
    maxWidth: '1072px',
    position: 'relative',

    [theme.breakpoints.down('xl')]: {
      maxWidth: '100%'
    }
  },
  sectionTitleText: {
    ...typography.heading1,
    textAlign: 'center',
    color: colors.invariant.text,
    [theme.breakpoints.down('sm')]: {
      ...typography.heading4
    }
  },
  shareButtonContainer: {
    width: '100%',
    marginTop: 24
  },
  shareContainer: {
    display: 'flex',
    gap: 8
  },
  nftWrapper: {
    width: '50%',
    position: 'relative',
    alignItems: 'center',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    height: 264,

    '& section': {
      ...typography.body2,
      color: colors.invariant.textGrey,
      maxWidth: 408,
      textAlign: 'center'
    },
    '& h4': {
      ...typography.heading4,
      color: colors.invariant.textGrey
    },
    '& h1': {
      ...typography.heading1,
      color: colors.invariant.text,
      fontSize: 40
    },
    [theme.breakpoints.down(1070)]: {
      height: 'auto'
    }
  },
  nftBackground: {
    display: 'flex',
    alignItems: 'center',
    gap: 48,
    position: 'relative',
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, rgba(17, 25, 49, 1) 35%, rgba(17, 25, 49, 1) 70%, rgba(17, 25, 49, 0.1) 100%)',

    [theme.breakpoints.down(1070)]: {
      flexDirection: 'column',
      gap: 0
    },

    width: '100%',
    maxWidth: 1210
  },
  nftCardWrapper: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center'
  },
  nftCard: {
    minHeight: 406,
    minWidth: 326
    // position: 'absolute',
    // top: -50,
    // right: 40,
    // [theme.breakpoints.down(1200)]: {
    //   right: -20
    // },
    // [theme.breakpoints.down(1070)]: {
    //   position: 'relative',
    //   top: 'auto',
    //   right: 'auto'
    // }
  }
}))
