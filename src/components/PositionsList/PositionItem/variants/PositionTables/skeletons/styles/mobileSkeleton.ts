import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
export const useMobileSkeletonStyles = makeStyles()(() => ({
  card: {
    padding: '16px',
    background: colors.invariant.component,
    borderRadius: '24px',
    marginBottom: '32px'
  },
  tokenIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chartContainer: {
    width: '80%',
    margin: '0 auto'
  }
}))
