import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ gradientDirection?: string; gradientPrimaryColor?: string }>()(
  theme => ({
    container: {
      display: 'flex',
      width: '100%',
      borderRadius: '24px',
      padding: '24px',
      boxSizing: 'border-box',
      maxWidth: '100%',
      [theme.breakpoints.down('lg')]: {
        height: 'auto',
        padding: '20px'
      },

      [theme.breakpoints.down('md')]: {
        maxWidth: '100%',
        padding: '16px'
      },

      [theme.breakpoints.down('sm')]: {
        padding: '12px',
        borderRadius: '16px',
        '&::before': {
          borderRadius: '16px'
        }
      }
    },
    titleWhite: {
      color: colors.invariant.text
    },
    titlePink: {
      color: colors.invariant.pink
    },
    titleGreen: {
      color: colors.invariant.green
    },
    contentContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      zIndex: 1
    },
    title: {
      fontSize: '48px',
      lineHeight: '1.2',
      textAlign: 'center',
      fontWeight: 700,
      color: colors.invariant.text,

      [theme.breakpoints.down('lg')]: {
        fontSize: '36px'
      },

      [theme.breakpoints.down('md')]: {
        fontSize: '30px'
      },

      [theme.breakpoints.down('sm')]: {
        fontSize: '24px'
      }
    },
    subtitle: {
      fontSize: '20px',
      lineHeight: '1.2',
      fontWeight: 400,
      textAlign: 'center',
      color: colors.invariant.textGrey,
      marginTop: '16px',

      [theme.breakpoints.down('lg')]: {
        fontSize: '18px',
        marginTop: '8px'
      },

      [theme.breakpoints.down('md')]: {
        fontSize: '16px',
        marginTop: '6px'
      },

      [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
        marginTop: '4px'
      }
    }
  })
)

export default useStyles
