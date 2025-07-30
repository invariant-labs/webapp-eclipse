import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'
//events cards style
interface StyleProps {
  borderColor: 'textGrey' | 'green' | 'pink'
  isImportant: boolean
  link?: string
}

export const useStyles = makeStyles<StyleProps>()((_theme, { borderColor, isImportant, link }) => {
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
      [theme.breakpoints.down('sm')]: {
        width: '253px',
        height: '372px'
      },
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: '24px',
      padding: '24px',
      overflow: 'hidden',
      boxSizing: 'content-box',
      '&:hover': {
        cursor: link ? 'pointer' : 'default'
      }
      // '&::before': {
      //   content: '""',
      //   position: 'absolute',
      //   top: 0,
      //   left: 0,
      //   right: 0,
      //   bottom: 0,
      //   zIndex: 5,
      //   borderRadius: '24px',
      //   padding: '2px',
      //   background: colors.invariant.pinkGreenLinearGradient,
      //   mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      //   maskComposite: 'exclude',
      //   pointerEvents: 'none'
      // }
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
