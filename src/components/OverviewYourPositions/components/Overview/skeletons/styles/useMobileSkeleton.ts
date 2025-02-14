// styles.ts
import { makeStyles } from 'tss-react/mui'
import { colors, theme } from '@static/theme'

export const useMobileSkeletonStyle = makeStyles()(() => ({
  container: {
    width: '100%',
    marginTop: theme.spacing(2)
  },
  chartContainer: {
    height: '24px',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    marginBottom: theme.spacing(3)
  },
  skeletonSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  tokenTextSkeleton: {
    marginBottom: theme.spacing(2),
    width: '60px',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  gridContainer: {
    marginTop: theme.spacing(1),
    width: '100% !important',
    minHeight: '120px',
    marginLeft: '0 !important',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '4px'
    }
  },
  gridItem: {
    paddingLeft: '0 !important',
    marginLeft: '0 !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  circularSkeleton: {
    width: '24px',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  tokenSymbolSkeleton: {
    width: '40px',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  valueSkeleton: {
    width: '100%',
    height: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'right'
  }
}))
