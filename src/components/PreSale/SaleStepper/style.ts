import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

const useStyles = makeStyles<{ connectorHeight: number }>()((theme, { connectorHeight }) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    position: 'relative',
    alignItems: 'flex-start',
    minHeight: '440px',
    width: '160px',
    paddingLeft: 16,
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'row',
      height: '100px',
      minHeight: '100px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingLeft: 0
    }
  },
  stepContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'column',
    [theme.breakpoints.up('lg')]: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    [theme.breakpoints.down('lg')]: {
      minWidth: 38,
      width: 38
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: 34,
      width: 34
    },
    [theme.breakpoints.down(550)]: {
      minWidth: 30,
      width: 30
    }
  },
  stepContainer: {
    display: 'flex',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      alignItems: 'center'
    }
  },
  stepMargin: {
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('lg')]: {
      marginBottom: 0,
      width: '30%'
    }
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
    position: 'relative',
    alignItems: 'center',
    zIndex: 2,
    color: colors.invariant.text,
    boxSizing: 'content-box',

    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(1),
      width: '28px',
      height: '28px'
    },
    [theme.breakpoints.down('sm')]: {
      width: '24px',
      height: '24px'
    },
    [theme.breakpoints.down(550)]: {
      borderWidth: '3px'
    }
  },

  activeNode: {
    background: colors.invariant.light
  },

  stepLabelContainer: {
    marginLeft: 10,
    textAlign: 'left'
  },

  stepLabel: {
    color: colors.invariant.text,
    ...typography.heading4,
    position: 'static',
    whiteSpace: 'nowrap',
    textAlign: 'left',

    [theme.breakpoints.down('lg')]: {
      marginLeft: 0,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      position: 'absolute',
      top: '120%',
      transform: 'translate(-50%,-50%)',
      left: '50%'
    }
  },

  stepLowerLabel: {
    ...typography.body2,
    color: colors.invariant.text
  },

  labelSkeleton: {
    marginLeft: '16px',
    [theme.breakpoints.down('lg')]: {
      maxHeight: '16px',
      marginTop: '16px',
      marginLeft: '2px',
      position: 'absolute',
      top: '80%',
      transform: 'translate(-50%,-50%)',
      left: '50%',
      textAlign: 'center'
    }
  },

  connector: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: colors.invariant.light,
    zIndex: 1,

    [theme.breakpoints.down('lg')]: {
      display: 'none'
    }
  },

  horizontalConnector: {
    display: 'none',

    [theme.breakpoints.down('lg')]: {
      display: 'block',
      marginBottom: '9px',
      top: '26%',
      left: '100%',
      height: '4px',
      width: `100%`,
      background: colors.invariant.light,
      zIndex: 1
    }
  },

  horizontalConnectorGreenPink: {
    display: 'none',
    [theme.breakpoints.down('lg')]: {
      display: 'block',
      marginBottom: '6px',

      top: '26%',
      left: '100%',
      transform: 'translateY(-50%)',
      height: '4px',
      width: '100%',
      background: `linear-gradient(to right, ${colors.invariant.green}, ${colors.invariant.textGrey})`,
      zIndex: 1
    },
    [theme.breakpoints.down(550)]: {
      height: '2px'
    }
  },

  horizontalConnectorGreenGray: {
    display: 'none',
    [theme.breakpoints.down('lg')]: {
      display: 'block',
      marginBottom: '10px',
      top: '26%',
      left: '100%',
      height: '4px',
      width: '100%',
      background: `linear-gradient(to right, ${colors.invariant.green}, ${colors.invariant.light})`,
      zIndex: 1
    }
  },

  horizontalConnectorGreenGrayPink: {
    display: 'none',
    [theme.breakpoints.down('lg')]: {
      display: 'block',
      marginBottom: '10px',

      top: '26%',
      left: '100%',
      height: '4px',
      width: `100%`,
      background: `linear-gradient(to right, ${colors.invariant.textGrey}, ${colors.invariant.pink})`,
      zIndex: 1
    }
  },

  horizontalConnectorGray: {
    display: 'none',
    [theme.breakpoints.down('lg')]: {
      display: 'block',
      top: '26%',
      left: '100%',
      marginBottom: '10px',
      width: '100%',
      height: '4px',
      background: colors.invariant.textGrey,
      zIndex: 1
    }
  },

  connectorGreenPink: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.pink})`,
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      display: 'none'
    }
  },

  connectorGreenGray: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.green}, ${colors.invariant.light})`,
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      display: 'none'
    }
  },

  connectorGreenGrayPink: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: `linear-gradient(to bottom, ${colors.invariant.textGrey}, ${colors.invariant.pink})`,
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      display: 'none'
    }
  },

  connectorGray: {
    position: 'absolute',
    left: '18px',
    top: '42px',
    width: '5px',
    height: `${connectorHeight}px`,
    background: colors.invariant.textGrey,
    zIndex: 1,
    [theme.breakpoints.down('lg')]: {
      display: 'none'
    }
  },

  endStepNode: {
    borderColor: colors.invariant.pink,
    boxShadow: '0px 0px 8px 4px #EF84F559'
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

  currentStepLowerLabel: {
    color: colors.invariant.pink,
    fontWeight: 700
  },

  pendingStepLabel: {
    color: colors.invariant.text
  },

  startStepLabel: {
    color: colors.invariant.green
  },
  labelText: {
    textAlign: 'center',
    ...typography.body1,
    [theme.breakpoints.down(550)]: {
      ...typography.caption4,
      fontWeight: 700
    }
  }
}))

export default useStyles
