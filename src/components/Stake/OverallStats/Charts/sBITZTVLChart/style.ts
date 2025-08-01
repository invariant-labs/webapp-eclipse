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
  volumeHeader: {
    color: colors.invariant.textGrey,
    ...typography.body2
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
  volumeStatusContainer: {
    marginLeft: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 'auto'
  },
  volumeStatusColor: {
    minWidth: 'auto',
    padding: '5px 15px 5px 15px',
    borderRadius: 6
  },

  volumeStatusHeader: {
    ...typography.caption3,
    filter: 'brightness(1.2)'
  },
  barContainer: {
    height: 200,
    display: 'flex'
  },
  volumeLow: {
    color: colors.invariant.Error
  },
  backgroundVolumeLow: {
    backgroundColor: 'rgba(251,85,95,0.2)'
  },
  backgroundVolumeUp: {
    backgroundColor: 'rgba(46, 224, 149,0.2)'
  },
  volumeUp: {
    color: colors.invariant.green
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
    color: colors.invariant.lightBlue,
    textAlign: 'center'
  }
}))
