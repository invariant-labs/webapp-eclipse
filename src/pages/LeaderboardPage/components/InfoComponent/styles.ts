import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  infoContainer: {
    width: '100%',
    marginTop: '72px',
    minHeight: '264px',
    padding: '25px max(15%, 20px)',
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      textAlign: 'center'
    },
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(32, 41, 70, 0.2) 0%, #202946 40%, #202946 80%, rgba(32, 41, 70, 0.2) 100%)',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  astronaut: {
    width: '100%',
    maxWidth: '276px',
    height: 'auto',
    marginLeft: '56px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  description: {
    color: colors.invariant.textGrey,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '20px',
    letterSpacing: '-0.03em',
    marginTop: '32px',
    maxWidth: '400px'
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
    maxWidth: '800px'
  },
  clipboardIcon: {
    fontSize: '16px',
    cursor: 'pointer',
    color: colors.invariant.newDark,
    '&:hover': {
      '@media (hover: none)': {
        color: colors.invariant.newDark
      }
    }
  },
  button: {
    boxShadow: '0px 0px 16px 0px #EF84F559',
    width: '185px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifySelf: 'center'
    },
    padding: '13px',
    gap: '8px',
    height: '44px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    ...typography.body1,
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
    }
  },
  linkButtonContainer: {
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      justifyContent: 'center'
    }
  }
}))
