import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '5% 30% 15% 15% 25% 10%',
    minHeight: '40px', // Increased from 34px to 40px
    backgroundColor: colors.invariant.component,
    borderBottom: `1px solid ${colors.invariant.light}`,
    whiteSpace: 'nowrap',
    width: '100%'
  },
  item: {
    color: colors.white.main,
    '& p': {
      ...typography.heading4
    }
  },
  header: {
    '& p': {
      ...typography.heading4,
      color: colors.invariant.textGrey,
      fontWeight: 400
    }
  },
  noBottomBorder: {
    borderBottom: 'none'
  },
  icons: {
    marginRight: 12,
    width: 'fit-content',
    display: 'flex',
    gap: '8px',
    [theme.breakpoints.down('lg')]: {
      marginRight: 12
    }
  },
  tokenIcon: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  blur: {
    width: 120,
    height: 30,
    borderRadius: 16,
    background: `linear-gradient(90deg, ${colors.invariant.component} 25%, ${colors.invariant.light} 50%, ${colors.invariant.component} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite'
  },

  claimButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5px 50px',
    height: '25px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '12px',
    fontFamily: 'Mukta',
    textTransform: 'none',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',

    '&:hover': {
      background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 8px rgba(46, 224, 154, 0.35)'
    },

    [theme.breakpoints.down('sm')]: {
      width: '100%',
      padding: '5px 20px'
    }
  }
}))
