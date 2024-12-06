import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    pageWrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
      padding: '10px'
    },
    tableContainer: {
      maxWidth: 1072,
      padding: '0 24px',
      borderRadius: '24px',
      backgroundColor: `${colors.invariant.component} !important`
    },
    input: {
      padding: '11px 12px',
      width: '100%',
      minHeight: '32px',
      boxSizing: 'border-box',
      ...typography.body2,
      outline: 'none',
      marginRight: -8,
      fontFamily: 'Mukta',
      outlineStyle: 'none',
      fontSize: 16,
      backgroundColor: colors.invariant.newDark,
      color: colors.invariant.lightGrey,
      borderRadius: 8,
      cursor: 'pointer',
      '&::placeholder': {
        color: colors.invariant.textGrey
      },
      '&:focus': {
        color: colors.white.main
      }
    },
    heroLogo: {
      maxWidth: '1072px',
      maxHeight: '85px'
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    columnInput: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%'
    },

    row: {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'row',
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column'
      }
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      gap: '24px',
      height: 'fit-content',
      background: colors.invariant.component,
      borderRadius: '24px',
      flex: '1 1 0',
      [theme.breakpoints.down('md')]: {
        flex: 'auto'
      }
    },
    counterItem: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },

    counterLabel: {
      ...typography.body1,
      color: colors.invariant.textGrey
    },
    counterYourPoints: {
      ...typography.heading1,
      background: colors.invariant.pinkLinearGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    counterYourRanking: {
      ...typography.heading1,

      background: colors.invariant.greenLinearGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    counterYourPointsPerDay: {
      ...typography.heading1,

      background: colors.invariant.yellow,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    switchPoolsContainer: {
      position: 'relative',
      width: 'fit-content',
      backgroundColor: colors.invariant.component,
      borderRadius: 10,
      overflow: 'hidden',
      display: 'inline-flex',
      height: 32,
      [theme.breakpoints.down('sm')]: {
        height: 48
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
        transition: 'all 0.2s',
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

    creatorMainContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      paddingTop: '24px',
      width: '100%'
    }
  }
})

export default useStyles
