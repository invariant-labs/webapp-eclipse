import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(_theme => {
  return {
    loaderContainer: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',

      textAlign: 'center'
    },
    animationImage: {
      width: '120px',
      height: '120px',
      marginBottom: '4px'
    },
    pleaseWaitText: {
      ...typography.heading4,
      color: colors.invariant.green,
      marginBottom: '4px'
    },
    lookingForRouteText: {
      ...typography.caption2,
      color: colors.invariant.text
    }
  }
})

export default useStyles
