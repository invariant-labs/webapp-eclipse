import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  container: {
    width: '100%',
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
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, rgba(17, 25, 49, 1) 35%, rgba(17, 25, 49, 1) 70%, rgba(17, 25, 49, 0.1) 100%)'
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
    width: '100%',
    borderRadius: '24px',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  tokenomicsItemContainer: {
    width: '50%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: '24px',
    marginBottom: '12px',
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
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
    height: '400px',
    left: '50%',
    top: -35
  }
}))

export default useStyles
