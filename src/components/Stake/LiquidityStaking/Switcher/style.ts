import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  switchTab: string
}

const useStyles = makeStyles<StyleProps>()((theme, { switchTab }) => {
  const getMarkerPosition = (switchTab: string) => {
    switch (switchTab) {
      case 'Stake':
        return '0'
      case 'Unstake':
        return '100%'
      default:
        return '0'
    }
  }

  return {
    container: {
      backgroundColor: colors.invariant.component,
      borderRadius: 8,
      boxSizing: 'border-box',
      marginLeft: 'auto'
    },
    mainWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      padding: 1,
      background: colors.invariant.componentBcg,
      borderRadius: 11,
      width: '100%'
    },

    switchPoolsContainer: {
      position: 'relative',
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'inline-flex',
      height: 46,

      [theme.breakpoints.down('md')]: {
        width: '95%'
      },
      [theme.breakpoints.down('sm')]: {
        height: 36,
        width: '100%'
      }
    },
    switchPoolsMarker: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 'calc(100% / 2)',
      backgroundColor: colors.invariant.light,
      borderRadius: 10,
      transition: 'transform 0.3s ease',
      zIndex: 1,
      transform: `translateX(${getMarkerPosition(switchTab)})`
    },
    switchButtonsGroup: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      width: '100%'
    },
    switchButton: {
      ...typography.heading4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      gap: 8,
      flex: 1,
      width: 60,
      minWidth: 'unset',
      textTransform: 'none',
      textWrap: 'nowrap',
      border: 'none',
      borderRadius: 10,
      zIndex: 2,
      transition: '300ms',
      '&.Mui-selected': {
        backgroundColor: 'transparent'
      },
      '&:hover': {
        filter: 'brightness(1.2)',
        borderRadius: 10
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

      '& svg *': {
        transition: 'color 0.3s ease'
      }
    }
  }
})

export default useStyles
