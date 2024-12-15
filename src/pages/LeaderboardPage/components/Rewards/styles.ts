import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  infoContainer: {
    width: '100%',
    marginTop: '72px',
    minHeight: '445px',
    padding: '25px max(15%, 20px)',
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
    fontSize: '24px',
    fontWeight: '400',
    lineHeight: '28px',
    letterSpacing: '-0.03em',
    marginTop: '32px',
    maxWidth: '800px'
  },
  header: {
    [theme.breakpoints.down('md')]: {
      fontSize: '30px'
    },
    color: colors.invariant.text,
    fontSize: '50px',
    fontWeight: '600',
    lineHeight: '40px',
    letterSpacing: '-0.03em',
    maxWidth: '800px'
  },
  clipboardIcon: {
    width: 32,
    cursor: 'pointer',
    color: colors.invariant.newDark,
    '&:hover': {
      '@media (hover: none)': {
        color: colors.invariant.newDark
      }
    }
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    justifySelf: 'center',
    // },
    padding: '13px ',
    gap: '10px',
    width: 'max-content',
    height: '50px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '16px',
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    ...typography.heading4,
    textTransform: 'none',
    color: colors.invariant.dark,
    '&:hover': {
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
    }
  },
  pointsValue: {
    color: colors.invariant.text,
    fontSize: '64px',
    fontWeight: 700,
    lineHeight: '36px',
    letterSpacing: '-3%',
    marginTop: '24px',
    [theme.breakpoints.down('md')]: {
      fontSize: '32px'
    }
  }
}))
