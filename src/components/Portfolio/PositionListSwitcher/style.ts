import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  switchPoolsContainer: {
    position: 'relative',
    width: 'fit-content',
    backgroundColor: colors.invariant.component,
    borderRadius: 10,
    overflow: 'hidden',
    display: 'inline-flex',
    height: 38,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8
    }
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
  switchPoolsButtonsGroup: { position: 'relative', zIndex: 2, display: 'flex' },
  switchPoolsButton: {
    ...typography.body2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    flex: 1,
    textTransform: 'none',
    border: 'none',
    borderRadius: 10,
    zIndex: 2,
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
    paddingLeft: 12,
    paddingRight: 12
  },
  disabledSwitchButton: {
    color: `${colors.invariant.textGrey} !important`
  }
}))
