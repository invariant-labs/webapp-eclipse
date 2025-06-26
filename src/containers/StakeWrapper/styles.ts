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
  titleWrapper: {
    paddingBottom: 16,
    display: 'flex',
    maxWidth: 510,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12
  },
  titleTextWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    },
    '& h1': {
      ...typography.heading4,
      whiteSpace: 'nowrap',
      color: colors.invariant.text
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
  }
}))

export default useStyles
