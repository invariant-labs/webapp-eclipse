import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => {
  return {
    wrapper: {
      backgroundColor: colors.invariant.component,
      borderRadius: 24,
      padding: 24,
      gap: 24,
      color: colors.invariant.text,
      [theme.breakpoints.down('sm')]: {}
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center'
    },
    darkBackground: {
      marginTop: 8,
      width: '100%',
      height: 24,
      backgroundColor: colors.invariant.dark,
      borderRadius: 8
    },
    gradientProgress: {
      width: '78%',
      height: 24,
      background: colors.invariant.pinkGreenLinearGradient,
      borderRadius: 8
    },
    pointsLabel: {
      backgroundColor: colors.invariant.light,
      borderRadius: 8,
      padding: '5px 8px',
      gap: 4
    },
    pinkText: {
      color: colors.invariant.pink
    },
    questionButton: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      border: 'none',
      textDecoration: 'none',
      background: 'none'
    },
    link: {
      textDecoration: 'underline',
      ...typography.body2,
      lineHeight: '24px',
      textAlign: 'left'
    },
    description: {
      ...typography.body2,
      marginTop: 8,
      color: colors.invariant.textGrey,
      letterSpacing: '-0.48px'
    }
  }
})
