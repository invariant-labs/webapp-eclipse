import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    width: '100%',
    marginTop: '24px',
    minHeight: '445px',
    padding: '32px 24px',
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    background:
      'linear-gradient(90deg, rgba(32, 41, 70, 0.2) 0%, #202946 22%, #202946 78%, rgba(32, 41, 70, 0.2) 100%)',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  innerContainer: {
    maxWidth: '1032px',
    gap: '32px',
    display: 'flex',
    flexDirection: 'column'
  },
  subtitle: {
    color: colors.invariant.textGrey,
    ...typography.heading4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'

    // [theme.breakpoints.down('md')]: {
    //   fontSize: '20px'
    // },
  },
  points: {
    color: colors.invariant.text,
    fontSize: 40,
    fontWeight: 700,
    lineHeight: '36px',
    padding: 16,
    letterSpacing: '-3%',
    textAlign: 'center'

    // [theme.breakpoints.down('md')]: {
    //   fontSize: '20px'
    // },
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

    borderRadius: '16px',
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    textTransform: 'none',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',

    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 8px rgba(46, 224, 154, 0.35)'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  description: {
    ...typography.body2,
    color: colors.invariant.textGrey
  },
  column: {
    display: 'flex',
    flex: '1 1 0 ',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingInline: 24,
    gap: 24
  },
  input: {
    background: colors.invariant.newDark,
    color: colors.white.main,
    borderRadius: 24,
    ...typography.heading4,

    height: 56,
    paddingInline: 24,
    border: 'none',
    outline: 'none'
  },
  verticalDivider: {
    width: 2,
    height: 174,
    background: colors.invariant.light
  },
  pink: {
    background: colors.invariant.pinkLinearGradientOpacity,
    '&:hover': {
      background: colors.invariant.pinkLinearGradient,
      transform: 'translateY(-2px)',
      boxShadow: '0px 0px 16px rgba(239, 132, 245, 0.35)'
    }
  },
  green: {
    background: colors.invariant.greenLinearGradientOpacity,
    '&:hover': {
      background: colors.invariant.greenLinearGradient,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    }
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
  }
}))
