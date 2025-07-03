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
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, #111931 29.21%, #111931 71%, rgba(17, 25, 49, 0.1) 100%);',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    gap: 36,
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column-reverse'
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
    [theme.breakpoints.down('lg')]: {
      minWidth: 'unset',
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
      marginLeft: 0,
      marginTop: '24px',
      width: '100%'
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
  slider: {
    minWidth: '100%',
    zIndex: 5,
    gap: '46px',
    '& .slick-track': {
      display: 'flex',
      justifyContent: 'space-between'
    },
    '& .slick-list': {
      [theme.breakpoints.up('lg')]: {
        margin: '0 -100px'
      }
    },
    '& .slick-slide > div': { padding: '0' },

    '& .slick-slide': {
      display: 'flex',
      [theme.breakpoints.down('sm')]: {
        margin: '0'
      },
      justifyContent: 'center'
    },
    '& .slick-arrow': {
      height: '40px'
    },
    '& .slick-arrow::before': {
      fontSize: '40px',
      opacity: 0,
      '&:hover': {
        boxShadow: '0 0 0 4px rgba(80, 207, 61, 1)'
      },
      color: colors.invariant.textGrey,
      transition: 'color 0.3s ease',
      [theme.breakpoints.down('sm')]: {
        fontSize: '34px'
      }
    },
    '& .slick-arrow:hover::before': {
      color: colors.invariant.text
    },
    '& .slick-arrow:focus::before, & .slick-arrow:active::before': {
      color: colors.invariant.textGrey
    },
    '@media (hover: hover)': {
      '& .slick-arrow:hover::before': {
        color: colors.invariant.text
      }
    },
    '& .slick-prev': {
      left: -150,
      [theme.breakpoints.down('lg')]: {
        left: -40
      },
      [theme.breakpoints.down('md')]: {
        left: -20
      },
      [theme.breakpoints.down('sm')]: {
        left: -30,
        zIndex: 3
      }
    },
    '& .slick-next': {
      right: -150,
      [theme.breakpoints.down('lg')]: {
        right: -40
      },
      [theme.breakpoints.down('md')]: {
        right: -10
      },
      [theme.breakpoints.down('sm')]: {
        right: -30,
        zIndex: 3
      }
    },
    [theme.breakpoints.down('lg')]: {
      '& .slick-list': {
        padding: '0 16px'
      }
    },
    [theme.breakpoints.down('sm')]: {
      '& .slick-list': {
        padding: '0 8px'
      },
      '& .slick-track': {
        margin: '0 auto'
      }
    }
  },
  cardsContainer: {
    display: 'flex',
    maxWidth: '1072px',
    [theme.breakpoints.down('lg')]: {
      width: '800px'
    },
    [theme.breakpoints.down('md')]: {
      width: '500px'
    },
    [theme.breakpoints.down('sm')]: {
      width: '300px'
    },
    width: '900px'
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
    marginTop: '24px',
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
    maxWidth: '1280px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 24,
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      marginTop: 48
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
    color: colors.invariant.text
  }
}))
