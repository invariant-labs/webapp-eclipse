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
  }
}))
