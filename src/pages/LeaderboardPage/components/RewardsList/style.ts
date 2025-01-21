import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
import fingerprintPink from '@static/png/fingerprintPink.png'
import fingerprintGreen from '@static/png/fingerprintGreen.png'

export const useStylesList = makeStyles<{ isMobile: boolean }>()((theme, { isMobile }) => ({
  container: {
    marginInline: 40,

    [theme.breakpoints.down('sm')]: {
      marginInline: 8
    }
  },
  list: {
    paddingRight: isMobile ? 12 : 48
  },
  scrollbarThumb: {
    backgroundColor: `${colors.invariant.pink} !important`,
    borderRadius: 5,
    width: 8
  },
  scrollbarTrack: {
    background: `${colors.invariant.light} !important`,
    borderRadius: 5,
    width: '8px !important'
  },
  scrollbarView: {
    overflowX: 'hidden !important' as any,

    '&::-webkit-scrollbar': {
      width: 6,
      background: colors.invariant.component
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: 6
    }
  },

  scrollbar: {
    margin: '72px auto 72px'
  }
}))

export const useStyles = makeStyles<{ isEven: boolean }>()((theme, { isEven }) => ({
  container: {
    padding: 24,
    borderRadius: 12,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    background: isEven ? colors.invariant.darkGreenGradient : colors.invariant.darkPinkGradient,
    zIndex: 2
  },
  innerContainer: {
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  leftItems: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-between',
      width: '100%'
    }
  },
  background: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: '95%',
    backgroundPosition: '0% 70%',
    backgroundRepeat: 'no-repeat',
    opacity: 0.45,
    borderRadius: '12px',
    backgroundImage: isEven ? `url(${fingerprintGreen})` : `url(${fingerprintPink})`
  },
  mobileBackgroundTop: {
    position: 'absolute',
    zIndex: -1,
    top: 0,
    left: 0,
    width: '100%',
    height: '45%',
    backgroundSize: '130% 100%',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    opacity: 0.45,
    borderRadius: '12px',
    backgroundImage: isEven ? `url(${fingerprintGreen})` : `url(${fingerprintPink})`,
    [theme.breakpoints.down('sm')]: {
      backgroundSize: '160% 100%'
    }
  },
  mobileBackgroundBottom: {
    position: 'absolute',
    zIndex: -1,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '45%',
    backgroundSize: '100% 100%',
    backgroundPosition: 'center bottom',
    backgroundRepeat: 'no-repeat',
    opacity: 0.45,
    borderRadius: '12px',
    backgroundImage: isEven ? `url(${fingerprintGreen})` : `url(${fingerprintPink})`,
    transform: 'scale(-1)',
    [theme.breakpoints.down('sm')]: {
      backgroundSize: '160% 100%'
    }
  },
  number: {
    color: colors.invariant.text,
    marginRight: 16,
    fontSize: 48,
    fontWeight: 700,
    lineHeight: '36px'
  },
  subtitle: {
    ...typography.heading4,
    color: colors.invariant.textGrey,
    textAlign: 'center',
    marginLeft: 10
  },
  title: {
    ...typography.heading3,
    color: colors.invariant.text,
    textAlign: 'center'
  },
  button: {
    height: 44,
    width: 200,
    background: colors.invariant.light,
    ...typography.body1,
    color: colors.invariant.textGrey,
    textTransform: 'none',
    borderRadius: 16,

    '&:hover': {
      background: colors.invariant.lightHover2,
      '@media (hover: none)': {
        background: colors.invariant.light
      }
    },
    '&:disabled': {
      background: colors.invariant.light,
      ...typography.body1,
      color: colors.invariant.textGrey,
      textTransform: 'none'
    }
  },
  buttonGreen: {
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
    fontFamily: 'Mukta',
    fontStyle: 'normal',
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
      width: '100%'
    }
  },
  label: {
    backgroundColor: colors.invariant.light,
    padding: '8px 16px',
    borderRadius: 16,
    maxWidth: 282,
    width: 282,

    [theme.breakpoints.down('md')]: {
      width: '100%'
    },

    p: {
      ...typography.body2,
      textAlign: 'center',
      color: colors.invariant.text,
      lineHeight: '24px'
    },
    span: {
      color: isEven ? colors.invariant.green : colors.invariant.pink,
      ...typography.body1,
      lineHeight: '24px'
    }
  }
}))
export default useStyles
