import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 24
  },
  infoContainer: {
    width: '100vw',
    minHeight: '445px',
    padding: '32px 24px',
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, #111931 29.21%, #111931 71%, rgba(17, 25, 49, 0.1) 100%);',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  contentWrapper: {
    display: 'flex'
  },
  stepperContainer: {
    display: 'flex',
    marginRight: '24px',
    minWidth: '440px'
  },
  roundComponentContainer: {
    height: '100%',
    marginLeft: '55px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardsContainer: {
    maxWidth: '1072px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    borderRadius: 32,
    marginTop: '24px'
  },
  animatedPreSaleCardsWrapper: {
    display: 'flex',
    width: '1280px',
    justifyContent: 'center',
    marginTop: '24px',
    position: 'relative',
    zIndex: 1
  },
  slider: {
    minWidth: '100%',
    '& .slick-track': {
      display: 'flex',
      justifyContent: 'space-between'
    },
    '& .slick-slide': {
      display: 'flex',
      justifyContent: 'center'
    },

    '& .slick-arrow': {
      height: '40px',
      [theme.breakpoints.down('sm')]: {
        height: '30px'
      }
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
      left: -50,
      [theme.breakpoints.down('lg')]: {
        left: -80
      },
      [theme.breakpoints.down('sm')]: {
        left: -4,
        zIndex: 3
      }
    },
    '& .slick-next': {
      right: -30,
      [theme.breakpoints.down('lg')]: {
        right: -20
      },
      [theme.breakpoints.down('sm')]: {
        right: 9,
        zIndex: 3
      }
    }
  }
}))
