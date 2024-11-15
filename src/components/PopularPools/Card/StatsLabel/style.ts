import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    background: 'linear-gradient(90deg, #111931 0%, #010514 100%)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '8px',
    outline: `1px solid ${colors.invariant.light}`,
    boxShadow: `0px 0px 5px 0px ${colors.invariant.light}`
  },
  title: {
    ...typography.caption4,
    color: colors.invariant.text
  },
  value: {
    ...typography.caption4,
    color: colors.invariant.green,
    textShadow: '0px 0px 5px rgba(46, 224, 154, 0.75)'
  }
}))
