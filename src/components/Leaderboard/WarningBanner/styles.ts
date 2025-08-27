import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  isHiding: boolean
}

const useStyles = makeStyles<StyleProps>()(theme => {
  return {
    container: {
      padding: '20px 12px 20px 24px',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      backgroundColor: colors.invariant.warningTransparent,
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 4px 20px 8px'
      }
    },
    mainWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      transition: 'height 0.3s ease-in-out, opacity 0.3s ease-in-out'
    },
    boxWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(9)
    },
    text: {
      color: colors.invariant.warning,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transform: 'translateY(0)',
      transition: 'transform 0.3s ease-in-out',
      ...typography.body3,
      opacity: 0.8,
      flexShrink: 1
    },
    icon: {
      flexShrink: 0,
      marginRight: '12px',
      height: '24px',
      width: '24px'
    },
    close: {
      flexShrink: 0,
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px',
      width: 12,
      height: 12
    }
  }
})

export default useStyles
