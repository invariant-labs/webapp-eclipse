import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

const useStyles = makeStyles<{ connectorHeight: number }>()((theme, { connectorHeight }) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    minHeight: '440px',
    padding: theme.spacing(2.5)
  },
  stepContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  stepMargin: {
    marginBottom: theme.spacing(5)
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colors.invariant.component,
    border: '5px solid',
    borderColor: colors.invariant.light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    color: colors.invariant.text
  },
  activeNode: {
    background: colors.invariant.light
  },
  stepLabel: {
    marginLeft: theme.spacing(2),
    color: colors.invariant.text
  },
  connector: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: colors.invariant.light,
    zIndex: 1
  },
  connectorGreenPink: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
    zIndex: 1
  },
  connectorGreenGray: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.light})`,
    zIndex: 1
  },
  connectorGreenGrayPink: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.textGrey}, ${colors.invariant.pink})`,
    zIndex: 1
  },
  connectorGray: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: colors.invariant.textGrey,
    zIndex: 1
  },
  endStepNode: {
    borderColor: colors.invariant.pink
  },
  startStepNode: {
    borderColor: colors.invariant.green
  },
  middleStepNode: {
    borderColor: colors.invariant.textGrey
  },

  currentStepLabel: {
    color: colors.invariant.pink
  },
  pendingStepLabel: {
    color: colors.invariant.textGrey
  },
  startStepLabel: {
    color: colors.invariant.green
  }
}))

export default useStyles
