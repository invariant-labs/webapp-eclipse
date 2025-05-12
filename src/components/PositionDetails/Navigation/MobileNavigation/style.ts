import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    background: colors.invariant.light,
    padding: 4,
    borderRadius: 8,
    flex: 1,
    '&:hover': {
      cursor: 'pointer'
    }
  },
  iconContainer: { display: 'flex', alignItems: 'center', gap: 3 },
  icon: {
    height: 20,
    width: 20,
    borderRadius: '100%'
  }
}))
