import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    borderRadius: 24,
    boxSizing: 'border-box'
  },
  volumeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontWeight: 'normal'
  },
  volumePercentContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  volumePercentHeader: {
    ...typography.heading1,
    letterSpacing: '-0.03em',
    color: colors.white.main,
    marginTop: 5
  },
  barContainer: {
    height: 335,
    display: 'flex'
  },
  tooltip: {
    background: colors.invariant.component,
    border: `1px solid ${colors.invariant.lightGrey}`,
    borderRadius: 5,
    width: 120,
    padding: 8
  },
  tooltipDate: {
    ...typography.caption2,
    color: colors.white.main,
    textAlign: 'center'
  },
  tooltipValue: {
    ...typography.caption1,
    color: colors.invariant.pink,
    textAlign: 'center'
  },
  loadingOverlay: {
    position: 'relative',
    width: '100%',
    height: 335,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backdropFilter: 'blur(4px)',
      zIndex: 10,
      pointerEvents: 'none',
      borderRadius: '24px'
    }
  },
  switchersContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 12
  }
}))
