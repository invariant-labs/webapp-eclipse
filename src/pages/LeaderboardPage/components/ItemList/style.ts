import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1072,
    borderRadius: '24px',
    maxHeight: '1700px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    backgroundColor: `${colors.invariant.component} !important`
  },
  pagination: {
    padding: '20px 0 10px 0',
    maxWidth: '100%'
  },
  waveImage: {
    pointerEvents: 'none',

    '& img': {
      width: '100%',
      position: 'absolute',
      objectFit: 'cover',
      zIndex: 0,
      opacity: 0.4
    }
  },
  topWave: {
    width: '100%',
    height: '530px',
    position: 'absolute',
    top: 0,
    left: 0
  },
  bottomWave: {
    width: '100%',
    height: '530px',
    position: 'absolute',
    bottom: 0,
    left: 0
  }
}))
