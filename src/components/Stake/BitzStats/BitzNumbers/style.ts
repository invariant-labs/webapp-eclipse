import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      flex: '1 1 0'
    },

    '& h2': {
      ...typography.heading4,
      color: colors.invariant.text,
      textAlign: 'left',
      width: '100%',
      marginBottom: '16px',
      marginTop: 72
    }
  },
  sectionWrapper: {
    height: 280,
    display: 'flex',
    background: colors.invariant.component,
    borderRadius: 24,
    width: '100%',
    padding: 24,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chartWrapper: {
    background: colors.invariant.component,
    borderRadius: 24,
    width: '100%',
    padding: 24
  },
  statWrapper: {
    alignItems: 'center',

    display: 'flex',
    width: '100%',
    flexDirection: 'column',

    '& h4': {
      textAlign: 'center',
      ...typography.heading2,
      color: colors.invariant.text
    },
    '& h3': {
      textAlign: 'center',

      fontWeight: 400,
      fontSize: '24px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey
    }
  }
}))

export default useStyles
