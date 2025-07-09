import { typography, colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    maxWidth: 1210,
    minHeight: '100%',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },

  subheaderDescription: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: colors.invariant.textGrey,
    ...typography.body1
  },
  learnMoreLink: {
    color: colors.invariant.green,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    ...typography.body1
  },
  clipboardIcon: {
    color: colors.invariant.green,
    width: 15
  },
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
    width: '100%'
  },
  switchPoolsContainerOverview: {
    position: 'relative',
    width: '100%',
    backgroundColor: colors.invariant.component,
    borderRadius: 10,
    overflow: 'hidden',
    display: 'flex',
    height: 32,
    marginBottom: '16px'
  },
  overviewHeaderTitle: {
    color: colors.invariant.text,
    ...typography.heading4
  },

  switchPoolsButtonsGroupOverview: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    width: '100%'
  },
  switchPoolsButtonOverview: {
    ...typography.body2,
    display: 'flex',
    textWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    flex: 1,
    textTransform: 'none',
    border: 'none',
    borderRadius: 10,
    zIndex: 2,
    width: '50%',
    '&.Mui-selected': {
      backgroundColor: 'transparent'
    },
    '&:hover': {
      backgroundColor: 'transparent'
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'transparent'
    },
    '&:disabled': {
      color: colors.invariant.componentBcg,
      pointerEvents: 'auto',
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: 'none',
        cursor: 'not-allowed',
        filter: 'brightness(1.15)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    },
    letterSpacing: '-0.03em',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 32,
    paddingRight: 32
  },
  switchPoolsMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: colors.invariant.light,
    borderRadius: 10,
    transition: 'all 0.3s ease',
    willChange: 'transform, left',
    transform: 'translateZ(0)',
    zIndex: 1
  },
  switchPoolsMarkerStake: {
    left: 0
  },
  switchPoolsMarkerStats: {
    left: '50%'
  },
  disabledSwitchButton: {
    color: `${colors.invariant.textGrey} !important`
  },
  statsContainer: {
    width: '100%',
    marginTop: '72px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsTitle: {
    ...typography.heading4,
    color: colors.invariant.text,
    textAlign: 'left',
    width: '100%',
    marginBottom: '16px'
  },
  filtersContainerOverview: {
    marginTop: '32px',
    maxWidth: '240px'
  },
  selectedToggleButton: {
    fontWeight: 700
  },
  unselectedToggleButton: {
    fontWeight: 400
  },
  subheaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '8px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  titleWrapper: {
    display: 'flex',
    width: '100%',
    height: '27px',
    maxWidth: 510,
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%'
    },
    marginBottom: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    [theme.breakpoints.down('sm')]: {
      gap: 8
    }
  },

  titleTextWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    [theme.breakpoints.down('sm')]: {
      gap: 8
    },
    '& h1': {
      ...typography.heading4,
      whiteSpace: 'nowrap',
      color: colors.invariant.text,
      margin: 0,
      [theme.breakpoints.down('sm')]: {
        whiteSpace: 'wrap'
      }
    }
  },
  refreshIcon: {
    width: 26,
    height: 21,
    cursor: 'pointer',
    transition: 'filter 300ms',
    '&:hover': {
      filter: 'brightness(1.5)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  refreshIconBtn: {
    padding: 0,
    margin: 0,
    minWidth: 'auto',
    background: 'none',
    '&:hover': {
      background: 'none'
    },
    '&:disabled': {
      opacity: 0.5
    }
  },
  refreshIconContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  animatedContainer: {
    display: 'flex',
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    transition: 'all 0.3s ease-in-out',
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse',
      alignItems: 'center'
    }
  },
  liquidityStakingWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    transition: 'transform 0.4s ease-in-out, width 0.4s ease-in-out',
    willChange: 'transform, width',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    zIndex: 2,
    width: '510px',

    [theme.breakpoints.down('md')]: {
      transform: 'none !important',
      width: 'auto'
    }
  },
  liquidityStakingExpanded: {
    transform: 'translateX(-80px)',
    width: '510px'
  },
  yourStatsWrapper: {
    position: 'absolute',
    right: 0,
    width: 'calc(50% - 20px)',
    maxWidth: '600px',
    opacity: 0,
    transform: 'translateX(200px)',
    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, visibility 0.1s linear 0.5s',
    willChange: 'opacity, transform, visibility',
    backfaceVisibility: 'hidden',
    pointerEvents: 'none',
    zIndex: 1,
    visibility: 'hidden',
    [theme.breakpoints.down('md')]: {
      position: 'relative',
      right: 'auto',
      width: '100%',
      maxWidth: '100%',
      transform: 'none !important'
    }
  },
  yourStatsVisible: {
    opacity: 1,
    transform: 'translateX(250px)',
    pointerEvents: 'auto',
    visibility: 'visible',
    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out, visibility 0s linear'
  },

  expandButton: {
    marginTop: '16px',
    backgroundColor: colors.invariant.component,
    color: colors.invariant.text,
    '&:hover': {
      backgroundColor: colors.invariant.light
    },
    ...typography.body2
  },
  statsExpanderButton: {
    height: 27,
    minWidth: '120px',
    [theme.breakpoints.down('md')]: {
      width: '90px',
      minWidth: '90px'
    },
    padding: '0px 8px',
    borderRadius: 8,
    backgroundColor: colors.invariant.component,
    color: colors.invariant.textGrey,
    fontSize: 14,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'none',
    transition: '300ms',

    '&:hover': {
      background: colors.invariant.light,
      color: colors.invariant.text,
      '@media (hover: none)': {
        backgroundColor: colors.invariant.component,
        color: colors.invariant.textGrey
      }
    },
    '&:disabled': {
      color: colors.invariant.light,
      transition: 'all 0.3s',
      pointerEvents: 'auto'
    },
    '&:disabled:hover': {
      background: colors.invariant.component,

      cursor: 'not-allowed'
    },
    p: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  },

  liquidityStakingHeaderWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },
  stakingContentWrapper: {
    display: 'flex',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse'
    }
  }
}))

export default useStyles
