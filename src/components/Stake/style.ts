import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((_theme: Theme) => ({
  wrapper: {
    marginTop: 24,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column'
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
  disabledSwitchButton: {
    color: `${colors.invariant.textGrey} !important`
  },
  statsContainer: {
    width: '100%',
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
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
  }
}))

export default useStyles
