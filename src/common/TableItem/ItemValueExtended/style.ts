import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(_theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex',
    justifyContent: 'space-between',
    flexGrow: 1,
    height: 64
  },

  title: {
    ...typography.body2,
    color: colors.invariant.textGrey,
    marginBottom: '4px',

    [theme.breakpoints.down('sm')]: {
      ...typography.caption2
    }
  },
  value: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%',
    flexBasis: 'auto',
    ...typography.heading4,
    color: colors.invariant.text,

    [theme.breakpoints.down('sm')]: {
      ...typography.body1
    }
  },
  secondValue: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    width: '100%',
    flexBasis: 'auto',
    ...typography.caption2,
    color: colors.invariant.textGrey,

    [theme.breakpoints.down('sm')]: {
      ...typography.caption4
    }
  }
}))
