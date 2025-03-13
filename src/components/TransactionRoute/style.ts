import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isLoading: boolean; width: string }>()((
  theme,
  { isLoading, width }
) => {
  return {
    container: {
      width,
      position: 'relative',
      height: '490px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      backgroundColor: colors.invariant.component,
      borderRadius: '24px',
      color: 'white',
      marginLeft: '20px',
      transition: 'width .1s ease-in-out'
    },
    routeTitle: {
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    graphContainer: {
      display: 'flex',
      height: '90%',
      justifyContent: isLoading ? 'center' : 'flex-start',
      position: 'relative'
    },
    tokenNode: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'absolute',
      zIndex: 2
    },
    tokenIcon: {
      width: 50,
      height: 50,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(1),
      backgroundColor: '#2a3154'
    },
    tokenSymbol: {
      fontWeight: 'bold',
      fontSize: '0.875rem'
    },
    tokenAmount: {
      fontSize: '0.75rem',
      opacity: 0.7
    },
    line: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      position: 'absolute',
      zIndex: 0
    },
    exchangeLabel: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: theme.spacing(0.5, 1.5),
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      zIndex: 2
    },
    exchangeIcon: {
      width: 16,
      height: 16,
      marginRight: theme.spacing(0.5),
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    exchangePercentage: {
      marginRight: theme.spacing(0.5)
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2),
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.5)',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
      zIndex: 10
    },
    arrowHead: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '8px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1
    }
  }
})

export default useStyles
