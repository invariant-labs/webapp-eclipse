// styles.ts
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  alignment: string
}

const useStyles = makeStyles<StyleProps>()((theme, { alignment }) => {
  const getMarkerPosition = (alignment: string) => {
    switch (alignment) {
      case 'leaderboard':
        return '0'
      case 'faq':
        return '100%'
      case 'claim':
        return '200%'
      default:
        return '0'
    }
  }

  return {
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
      },
      [theme.breakpoints.down('md')]: {
        width: '95%'
      }
    },
    switchPoolsMarker: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 'calc(100% / 3)',
      backgroundColor: colors.invariant.light,
      borderRadius: 10,
      transition: 'transform 0.3s ease',
      zIndex: 1,
      transform: `translateX(${getMarkerPosition(alignment)})`
    },
    switchPoolsButtonsGroup: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      width: '100%'
    },
    switchPoolsButton: {
      ...typography.body2,
      fontFamily: 'Arial',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      flex: 1,
      width: 'calc(100% / 3)', // Ustawienie dokładnej szerokości dla każdego przycisku
      minWidth: 'unset', // Usuwa domyślny minWidth z MUI
      textTransform: 'none',
      textWrap: 'nowrap',
      border: 'none',
      borderRadius: 10,
      zIndex: 2,
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
    leaderboardHeaderSectionTitle: { ...typography.heading3, color: colors.white.main }
  }
})

export default useStyles
