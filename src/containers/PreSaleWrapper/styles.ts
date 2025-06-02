import { alpha } from '@mui/material'
import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 24,
    padding: '0 16px',
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      gap: 16
    }
  },
  infoContainer: {
    width: '100vw',
    minHeight: '445px',
    padding: '32px 24px',
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
    [theme.breakpoints.down('md')]: {
      padding: '24px 16px',
      minHeight: 'auto'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '16px 8px'
    }
  },
  contentWrapper: {
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column-reverse',
      width: '100%',
      alignItems: 'center',
      gap: 32
    }
  },
  stepperContainer: {
    display: 'flex',
    marginRight: '24px',
    minWidth: '440px',
    [theme.breakpoints.down('lg')]: {
      minWidth: 'unset',
      width: '100%',
      marginRight: 0,
      flexDirection: 'column',
      alignItems: 'center'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  roundComponentContainer: {
    height: '100%',
    marginLeft: '55px',
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

  animatedPreSaleCardsWrapper: {
    display: 'flex',
    width: '1280px',
    justifyContent: 'center',
    marginTop: '24px',
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      width: '100%'
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
      flexDirection: 'column'
    }
  },
  animatedCardsContainer: {
    maxWidth: '1072px',
    width: '100%',
    marginTop: '24px',

    [theme.breakpoints.down('md')]: {
      marginTop: '16px'
    }
  },
  animatedCardWrapper: {
    width: '50%',
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  animatedCardItem: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    [theme.breakpoints.down('md')]: {
      padding: '8px',
      width: '100%',
      marginBottom: '8px'
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
      margin: '0 -250px',
      [theme.breakpoints.up('sm')]: {
        margin: '0 -50px'
      },
      [theme.breakpoints.up('md')]: {
        margin: '0 -100px'
      },

      [theme.breakpoints.up('lg')]: {
        margin: '0 -190px'
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
    marginTop: '24px',
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
  arrowIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: '24px',
    height: 40,
    padding: '8px 12px',
    borderRadius: '12px',
    background: colors.invariant.light,
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
      background: 'linear-gradient(90deg, rgba(36, 248, 3, 0.12), rgba(80, 207, 61, 0))',
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
  faqContainer: {
    width: '100%',
    maxWidth: '1072px',
    marginTop: '72px',
    padding: '0 16px',
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      marginTop: '48px'
    }
  },
  sectionTitle: {
    marginTop: '72px',
    width: '100%',
    maxWidth: '1280px',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      marginTop: '48px'
    }
  },
  dexChartContainer: {
    maxWidth: '1072px',
    marginTop: '24px',
    position: 'relative',

    [theme.breakpoints.down('xl')]: {
      maxWidth: '100%'
    }
  }
}))
