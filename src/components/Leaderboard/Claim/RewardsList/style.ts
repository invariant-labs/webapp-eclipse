import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
import fingerprintPink from '@static/png/fingerprintPink.webp'
import fingerprintGreen from '@static/png/fingerprintGreen.webp'
import { keyframes } from 'tss-react'

const fadeAnimation1 = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`

const fadeAnimation2 = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`
interface useStylesListProps {
  displayAnimation: boolean
  isTop: boolean
  isBottom: boolean
}
export const useStylesList = makeStyles<useStylesListProps>()(
  (theme, { displayAnimation, isTop, isBottom }) => ({
    container: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '72px 40px 72px',

      [theme.breakpoints.down('sm')]: {
        marginInline: 16
      }
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
    list: {
      paddingRight: 48,

      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing(3),
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down('lg')]: {
        marginBottom: 0
      }
    },
    historyLabel: {
      marginBottom: theme.spacing(3),
      ...typography.heading3,
      color: colors.invariant.text,
      [theme.breakpoints.up('lg')]: {
        marginRight: 44
      }
    },
    rewardWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing(3),
      marginBottom: theme.spacing(0)
    },

    arrowIcon: {
      width: 52,
      zIndex: 3,
      animation: displayAnimation ? `${fadeAnimation1} 2s ease-in-out infinite` : 'none'
    },
    arrowTopIcon: {
      transform: 'rotate(180deg)',
      width: 52,
      zIndex: 3,
      animation: `${fadeAnimation1} 2s ease-in-out infinite`
    },
    arrowIcon2: {
      width: 52,
      position: 'absolute',
      opacity: displayAnimation ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      animation: displayAnimation ? `${fadeAnimation2} 2s ease-in-out infinite` : 'none',
      bottom: 3
    },
    arrowTopIcon2: {
      transform: 'rotate(180deg)',
      width: 52,
      position: 'absolute',
      transition: 'opacity 0.3s ease-in-out',
      animation: `${fadeAnimation2} 2s ease-in-out infinite`,
      top: 3
    },
    topArrowIconWrapper: {
      position: 'relative',
      cursor: 'pointer',
      flexDirection: 'column',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      height: 60,
      marginRight: 40,
      opacity: isTop ? 0 : 1,
      pointerEvents: isTop ? 'none' : 'auto',
      transition: 'all 0.3s ease-in-out'
    },
    arrowIconWrapper: {
      cursor: 'pointer',
      bottom: -60,
      position: 'absolute',
      flexDirection: 'column',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      height: 60,
      marginRight: 40,
      opacity: isBottom ? 0 : 1,
      pointerEvents: isBottom ? 'none' : 'auto',
      transition: 'all 0.3s ease-in-out'
    }
  })
)

export const useStyles = makeStyles<{ isEven: boolean }>()((theme, { isEven }) => ({
  container: {
    padding: 24,
    borderRadius: 12,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    background: isEven ? colors.invariant.darkGreenGradient : colors.invariant.darkPinkGradient,
    zIndex: 2,
    alignItems: 'center'
  },
  rewardWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  innerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    textAlign: 'center'
  },
  title: {
    ...typography.heading3,
    color: colors.invariant.text,
    textAlign: 'center'
  },
  infoText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    maxWidth: 200,
    width: 200,
    background: colors.invariant.light,
    ...typography.body1,
    color: colors.invariant.textGrey,
    borderRadius: 16,
    textDecoration: 'none',
    border: 'none'
  },
  textGreen: {
    color: colors.invariant.green
  },
  infoWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(2)
    }
  },
  pointsWrapper: {
    gap: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  centerWrapper: {
    display: 'flex',
    gap: theme.spacing(3),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: theme.spacing(6),
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  label: {
    backgroundColor: colors.invariant.light,
    padding: '8px 16px',
    borderRadius: 16,
    maxWidth: 282,
    width: 282,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

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
