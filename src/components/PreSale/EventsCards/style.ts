import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

interface StyleProps {
  borderColor: 'textGrey' | 'green' | 'pink'
  isImportant: boolean
}

const useStyles = makeStyles<StyleProps>()((_theme, { borderColor, isImportant }) => {
  const getBorderColor = () => {
    switch (borderColor) {
      case 'green':
        return colors.invariant.green
      case 'pink':
        return colors.invariant.pink
      case 'textGrey':
      default:
        return colors.invariant.textGrey
    }
  }

  return {
    container: {
      width: '293px',
      height: '372px',
      position: 'relative',
      background: colors.invariant.component,
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '24px',
      padding: '24px',
      overflow: 'hidden',
      boxSizing: 'content-box'
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      backgroundSize: 'cover'
    },
    contentWrapper: {
      zIndex: 10
    },
    imageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },

    title: {
      ...typography.heading3,
      color: colors.invariant.text,
      marginTop: '32px',
      alignSelf: 'flex-start',
      paddingLeft: '12px',
      borderLeft: `2px solid ${getBorderColor()}`
    },
    description: {
      ...typography.body2,
      color: isImportant ? colors.invariant.Error : colors.invariant.textGrey,
      marginTop: '16px'
    }
  }
})

export default useStyles
