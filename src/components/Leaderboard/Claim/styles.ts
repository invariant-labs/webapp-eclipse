import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  infoContainer: {
    width: '100vw',
    minHeight: '445px',
    padding: '32px 24px',
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(32, 41, 70, 0.2) 0%, #202946 22%, #202946 78%, rgba(32, 41, 70, 0.2) 100%)',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  astronaut: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    marginLeft: '56px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  description: {
    color: colors.invariant.textGrey,
    [theme.breakpoints.down('md')]: {
      fontSize: '20px'
    },
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '20px',
    letterSpacing: '-0.03em',
    marginTop: '32px',
    maxWidth: '1032px'
  },
  pointsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '32px'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& p': {
      color: colors.invariant.textGrey,
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '24px',
      letterSpacing: '-3%'
    }
  },
  description2: {
    color: colors.invariant.textGrey,
    [theme.breakpoints.down('md')]: {
      fontSize: '20px'
    },
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '20px',
    letterSpacing: '-0.03em',
    maxWidth: '1032px',
    display: 'flex',
    justifyItems: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: '32px'
  },
  header: {
    [theme.breakpoints.down('md')]: {
      fontSize: '30px'
    },
    color: colors.invariant.text,
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '36px',
    letterSpacing: '-0.03em',
    maxWidth: '1032px'
  },
  clipboardIcon: {
    width: 14,
    cursor: 'pointer',
    color: colors.invariant.newDark,
    '&:hover': {
      '@media (hover: none)': {
        color: colors.invariant.newDark
      }
    }
  },
  connectWalletButton: {
    height: '44px !important',
    borderRadius: 16,
    width: 200,
    marginTop: 32,
    fontSize: 14,
    fontWeight: 400
  },
  button: {
    ...typography.body1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    justifySelf: 'center',
    padding: '13px',
    gap: '8px',
    width: '200px',
    height: '44px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    textTransform: 'none',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 8px rgba(46, 224, 154, 0.35)'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  pointsValue: {
    color: colors.invariant.text,
    fontSize: '40px',
    fontWeight: 700,
    lineHeight: '36px',
    letterSpacing: '-3%',
    [theme.breakpoints.down('md')]: {
      fontSize: '32px'
    }
  },
  learnMoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}))
