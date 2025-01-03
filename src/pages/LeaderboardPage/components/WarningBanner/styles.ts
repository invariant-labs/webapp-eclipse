import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

interface StyleProps {
  isHiding: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { isHiding }) => {
  return {
    container: {
      padding: isHiding ? '0px 0px' : '20px 12px 20px 24px',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      backgroundColor: colors.invariant.warningTransparent,
      transition: 'all 0.3s ease-in-out',
      willChange: 'height,padding,margin',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      transform: isHiding ? 'scaleY(0)' : 'scaleY(1)',
      [theme.breakpoints.down('sm')]: {
        padding: isHiding ? '0px 0px' : '20px 4px 20px 8px'
      }
    },
    text: {
      color: colors.invariant.warning,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transform: isHiding ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.3s ease-in-out',
      ...typography.body3,
      opacity: 0.8,
      flexShrink: 1
    },
    icon: {
      flexShrink: 0,
      marginRight: '12px',
      height: isHiding ? 0 : '24px',
      width: '24px'
    },
    close: {
      flexShrink: 0,
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '12px',
      width: 12,
      height: isHiding ? 0 : 12
    }
  }
})

export default useStyles
