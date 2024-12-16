import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    width: '100%',
    borderRadius: '24px',
    maxHeight: '1800px',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    backgroundColor: `${colors.invariant.component} !important`
  },
  pagination: {
    padding: '20px 0 10px 0',
    maxWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  waveImage: {
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      width: '100%',
      maxHeight: '400px',
      position: 'absolute',
      objectFit: 'cover',
      zIndex: 0,
      opacity: 0.4
    }
  },
  topWave: {
    width: '100%',
    maxHeight: '530px',
    position: 'absolute',
    top: 0,
    left: 0
  },
  bottomWave: {
    width: '100%',
    maxHeight: '530px',
    position: 'absolute',
    bottom: 0,
    left: 0
  }
}))
