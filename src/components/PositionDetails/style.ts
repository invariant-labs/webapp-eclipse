import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  wrapperContainer: {
    width: 1004,
    flexDirection: 'row',
    maxWidth: '100%',

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  positionDetails: {
    width: 517,
    marginRight: 24,

    [theme.breakpoints.down('lg')]: {
      width: '100%'
    },

    [theme.breakpoints.down('md')]: {
      marginRight: 0
    }
  },
  right: {
    width: 517,
    [theme.breakpoints.down('lg')]: {
      width: '100%'
    }
  },
  back: {
    height: 40,
    width: 'fit-content',
    transition: 'filter 300ms',

    '&:hover': {
      filter: 'brightness(2)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  backIcon: {
    width: 22,
    height: 24,
    marginRight: 12
  },
  backText: {
    color: 'rgba(169, 182, 191, 1)',
    WebkitPaddingBefore: '2px',
    ...typography.body2
  },
  button: {
    color: colors.invariant.black,
    ...typography.body1,
    textTransform: 'none',
    background: colors.invariant.pinkLinearGradientOpacity,
    borderRadius: 14,
    height: 40,
    width: 130,
    paddingRight: 9,
    paddingLeft: 9,
    letterSpacing: -0.03,

    '&:hover': {
      background: colors.invariant.pinkLinearGradient,
      boxShadow: `0 0 16px ${colors.invariant.pink}`,
      '@media (hover: none)': {
        background: colors.invariant.pinkLinearGradientOpacity,
        boxShadow: 'none'
      }
    }
  },
  buttonStartIcon: {
    marginRight: 0
  },
  buttonText: {
    WebkitPaddingBefore: '2px'
  },
  backContainer: {
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  positionPlotWrapper: {
    width: '100%',
    marginTop: 30,

    [theme.breakpoints.down('md')]: {
      marginTop: 0
    }
  },
  marketIdWithRefresher: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'space-between'
    }
  },
  rightHeaderWrapper: {
    marginBottom: 20,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 0
    }
  },
  link: {
    maxHeight: 14,
    height: 14,
    width: 14,

    '&:hover': {
      filter: 'brightness(1.2)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  unlockButton: {
    color: colors.invariant.black,
    background: colors.invariant.greenLinearGradientOpacity,
    borderRadius: 12,
    height: 40,
    padding: 0,
    minWidth: 40,
    transition: '300ms',
    '&:hover': {
      background: colors.invariant.greenLinearGradient,
      boxShadow: `0 0 16px ${colors.invariant.greenLinearGradient}`
    },
    '&:disabled': {
      background: colors.invariant.light,
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
    }
  },
  lockButton: {
    color: colors.invariant.black,
    background: colors.invariant.pinkLinearGradientOpacity,
    borderRadius: 12,
    height: 40,
    padding: 0,
    minWidth: 40,
    transition: '300ms',
    '&:hover': {
      background: colors.invariant.pinkLinearGradient,
      boxShadow: `0 0 16px ${colors.invariant.pink}`
    },
    '&:disabled': {
      background: colors.invariant.light,
      color: colors.invariant.componentBcg,
      pointerEvents: 'auto',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: 'none',
        cursor: 'not-allowed',
        filter: 'brightness(1.15)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    }
  },
  informationContainer: {
    marginBottom: 24
  },
  information: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }
}))
