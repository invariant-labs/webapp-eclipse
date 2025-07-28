import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: colors.invariant.light,
    height: 40,
    borderRadius: 6,

    '& p': {
      ...typography.caption2
    }
  },
  disabled: {
    filter: 'brightness(0.8)',
    cursor: 'not-allowed'
  }
}))
