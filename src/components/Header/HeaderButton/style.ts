import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    headerButton: {
      background: 'transparent',
      color: colors.white.main,
      paddingInline: 12,
      borderRadius: 14,
      textTransform: 'none',
      ...typography.body1,
      lineHeight: '22px',
      height: 32,
      boxShadow: 'none',
      '&:hover': {
        background: colors.invariant.light,
        '@media (hover: none)': {
          background: 'transparent'
        }
      },
      '&:active': {
        '& #downIcon': {
          transform: 'rotateX(180deg)'
        }
      },
      [theme.breakpoints.down('sm')]: {
        paddingInline: 6
      }
    },
    label: {
      WebkitPaddingBefore: '2px'
    },
    headerButtonConnect: {
      background: colors.invariant.pinkLinearGradientOpacity,
      color: colors.invariant.newDark,
      paddingInline: 12,
      borderRadius: 14,
      textTransform: 'none',
      ...typography.body1,
      height: 40,
      minWidth: 130,

      [theme.breakpoints.down('xs')]: {
        minWidth: 100,
        width: 130
      },

      '&:hover': {
        boxShadow: `0 0 15px ${colors.invariant.light}`,
        backgroundColor: colors.invariant.light,
        '@media (hover: none)': {
          background: colors.invariant.pinkLinearGradientOpacity,
          boxShadow: 'none'
        }
      }
    },
    headerButtonConnected: {
      background: colors.invariant.light,
      color: colors.white.main,
      paddingInline: 12,
      borderRadius: 14,
      textTransform: 'none',
      ...typography.body1,
      height: 40,

      '&:hover': {
        background: colors.blue.deep,
        '@media (hover: none)': {
          background: colors.invariant.light
        }
      }
    },
    headerButtonTextEllipsis: {
      textTransform: 'none',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...typography.body1,
      whiteSpace: 'nowrap'
    },
    disabled: {
      color: `${colors.invariant.textGrey} !important`,
      cursor: 'not-allowed !important',

      '&:hover': {
        background: 'transparent',
        boxShadow: 'none'
      }
    },
    paper: {
      background: 'transparent',
      boxShadow: 'none'
    },
    startIcon: {
      marginLeft: 0,
      marginBottom: 3
    },
    endIcon: {
      minWidth: 20,
      marginTop: 2
    },
    innerEndIcon: {
      marginLeft: 0,
      marginBottom: 3
    },
    warningIcon: {
      height: 16,
      marginRight: 4
    }
  }
})

export default useStyles
