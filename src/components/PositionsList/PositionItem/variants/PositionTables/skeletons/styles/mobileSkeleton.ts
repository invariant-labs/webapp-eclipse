import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
export const useMobileSkeletonStyles = makeStyles()(() => ({
  card: {
    height: '270px',
    padding: '8px',
    background: colors.invariant.component,
    borderRadius: '24px',
    '&:first-child': {
      marginTop: '16px'
    },
    marginBottom: '16px'
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
