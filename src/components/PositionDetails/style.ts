import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  mainContainer: {
    flex: 1,
    width: '100%'
  },
  container: {
    display: 'flex',
    gap: 16,
    marginTop: 24,
    marginBottom: 48,

    [theme.breakpoints.down(1040)]: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 24,
      marginBottom: 0
    }
  },
  leftSide: {
    width: 464,

    [theme.breakpoints.down(1040)]: {
      flexGrow: 1,
      width: '100%'
    }
  },
  rightSide: {
    flexGrow: 1
  },
  information: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  arrow: {
    color: colors.invariant.green,
    position: 'absolute',
    zIndex: 2,
    cursor: 'pointer',
    overflow: 'visible',
    top: '50%',

    '& path': {
      transition: 'filter 0.3s'
    },
    '&:hover': {
      '& path': {
        filter: 'drop-shadow(0px 0px 6px rgba(46, 224, 154, 0.8))'
      }
    }
  },
  leftArrow: {
    transform: 'scale(-1)',
    left: -88
  },
  rightArrow: {
    left: 'unset',
    right: -88
  }
}))
