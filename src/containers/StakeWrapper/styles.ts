import { typography, colors } from '@static/theme'
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
  header: {
    ...typography.heading1,
    color: colors.white.main
  },
  subheaderDescription: {
    display: 'flex',
    gap: '4px',
    color: colors.invariant.textGrey,
    ...typography.heading4
  },
  learnMoreLink: {
    color: colors.invariant.green,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    ...typography.heading4
  },
  clipboardIcon: {
    color: colors.invariant.green
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
    marginBottom: '20px'
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
  }
}))

export default useStyles
