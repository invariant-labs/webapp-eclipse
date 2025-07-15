import { alpha } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  container: {
    width: '100%',
    display: 'flex',
    zIndex: 90,
    position: 'relative',
    borderRadius: '24px',
    background: `linear-gradient(90deg, ${alpha(colors.invariant.component, 0.1)} 0%, ${colors.invariant.component} 30%,  ${colors.invariant.component} 70%, ${alpha(colors.invariant.component, 0.1)} 100%)`,
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '600px',
      background: colors.invariant.component,
      alignItems: 'center'
    }
  },
  gridContainer: {
    width: '100%',
    maxWidth: '600px',
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
  chartImage: {
    position: 'absolute',
    height: '400px',
    left: '50%',
    top: -35,
    [theme.breakpoints.down('lg')]: {
      width: '250px',
      height: '250px',
      left: 0,
      top: 0,
      position: 'relative',
      padding: 32
    }
  }
}))

export default useStyles
