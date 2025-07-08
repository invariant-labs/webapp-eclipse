import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
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
