import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

const useStyles = makeStyles()(theme => ({
  container: {
    padding: '24px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column-reverse',
    zIndex: 90,
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
  containerBackground: {
    background: `linear-gradient(90deg, ${colors.invariant.component}ff 40%, ${colors.invariant.component}00 100%)`
  },
  mobileChartContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(4)
  },
  mobileChart: {
    width: '250px',
    height: '250px',
    objectFit: 'contain'
  },
  gridContainer: {
    maxWidth: '600px',
    borderRadius: '24px'
  },
  tokenomicsItemContainer: {
    width: '100%',
    height: '64px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: '24px',
    marginBottom: '12px'
  },
  arcContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  textContainer: {
    marginLeft: '24px'
  },
  desktopChartImage: {
    position: 'absolute',
    width: '450px',
    height: '450px',
    left: '50%',
    top: '-5%'
  }
}))

export default useStyles
