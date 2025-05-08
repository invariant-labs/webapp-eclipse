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
    zIndex: 2,
    cursor: 'pointer',
    overflow: 'visible',
    top: '50%',
    padding: 16,

    '& path': {
      transition: 'filter 0.3s'
    },
    '&:hover': {
      '& path': {
        filter: 'drop-shadow(0px 0px 6px rgba(46, 224, 154, 0.8))'
      }
    }
  },
  leftArrowWrapper: {
    position: 'absolute',
    top: '50%',
    transform: 'scale(-1)',
    left: -88
  },
  rightArrowWrapper: {
    position: 'absolute',
    top: '50%',
    right: -88
  },
  tokenIcon: {
    width: 24,
    borderRadius: '100%',
    [theme.breakpoints.down('sm')]: {
      width: 28
    }
  },
  iconsShared: {
    alignItems: 'center',
    flexWrap: 'nowrap',

    width: 'fit-content',
    [theme.breakpoints.down('lg')]: {
      marginRight: 12
    }
  }
}))
