import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ gradientDirection?: string; gradientPrimaryColor?: string }>()(
  (theme, { gradientDirection, gradientPrimaryColor }) => ({
    container: {
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: '130px',
      background: `linear-gradient(${gradientDirection}, #ef84f500 0%, ${gradientPrimaryColor}40 100%), #202946`,

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '24px',
        padding: '2px',
        background: `linear-gradient(${gradientDirection} ,#A9B6BF26, ${gradientPrimaryColor})`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        pointerEvents: 'none'
      },

      borderRadius: '24px',
      padding: '24px',
      boxSizing: 'border-box',
      maxWidth: '100%',
      [theme.breakpoints.down('lg')]: {
        height: 'auto',
        minHeight: '110px',
        padding: '20px'
      },

      [theme.breakpoints.down('md')]: {
        maxWidth: '100%',
        minHeight: '90px',
        padding: '16px'
      },

      [theme.breakpoints.down('sm')]: {
        minHeight: '80px',
        padding: '12px',
        borderRadius: '16px',
        // Update border radius in pseudo-element for smaller screens
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
      position: 'relative', // Ensure content stays above border
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
      marginTop: '12px',

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
