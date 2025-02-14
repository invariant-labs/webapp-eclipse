import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'
import { CHART_CONSTANTS } from './consts'

export const useMinMaxChartStyles = makeStyles()(() => ({
  container: {
    width: '100%',
    height: '55px',
    display: 'flex',
    marginTop: '18px',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    position: 'relative',
    flexDirection: 'column'
  },
  chart: {
    width: '100%',
    display: 'flex',
    borderBottom: `2px solid ${colors.invariant.light}`,
    position: 'relative',
    overflow: 'visible'
  },
  handleLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 100,
    transform: `translateX(-${CHART_CONSTANTS.CHART_PADDING}px)`
  },

  handleRight: {
    position: 'absolute',
    left: `${CHART_CONSTANTS.MAX_HANDLE_OFFSET}%`,
    top: 0,
    zIndex: 100
  },
  currentValueIndicator: {
    ...typography.caption2,
    color: colors.invariant.yellow,
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '-16px',
    whiteSpace: 'nowrap',
    zIndex: 101
  },
  priceLineIndicator: {
    position: 'absolute',
    width: '2px',
    height: '25px',
    backgroundColor: colors.invariant.yellow,
    top: '0%',
    transform: 'translateX(-50%)',
    zIndex: 50
  }
}))
