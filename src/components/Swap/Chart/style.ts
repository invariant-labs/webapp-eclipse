import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    borderRadius: 24,
    position: 'relative',
    alignItems: 'stretch',

    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  headerWrapper: {
    display: 'flex',
    marginBottom: 24,
    gap: 8,
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  labelWrapper: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 12,
    [theme.breakpoints.down(1200)]: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    background: colors.invariant.component,
    padding: 24,
    borderRadius: 24,

    [theme.breakpoints.down('sm')]: {
      padding: '24px 8px'
    }
  },
  title: {
    ...typography.heading4,
    color: colors.white.main,
    alignContent: 'center',
    height: 27,
    marginBottom: 16
  },
  chart: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  skeleton: {
    borderRadius: 12,
    top: 0
  },
  iconsAndNames: {
    flexWrap: 'nowrap',
    width: '100%',
    display: 'flex',
    height: 44
  },

  tokenIcon: {
    width: 36,
    borderRadius: '100%',
    [theme.breakpoints.down('sm')]: {
      width: 28
    }
  },
  iconsShared: {
    alignItems: 'center',
    flexWrap: 'nowrap',
    marginRight: 12,
    width: 'fit-content',
    [theme.breakpoints.down('lg')]: {
      marginRight: 12
    }
  },

  tickersContainer: {
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center'
  },
  names: {
    ...typography.heading2,
    color: colors.invariant.text,
    lineHeight: '40px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('xl')]: {
      ...typography.heading2
    },
    [theme.breakpoints.down('lg')]: {
      lineHeight: '32px',
      width: 'unset'
    },
    [theme.breakpoints.down('sm')]: {
      ...typography.heading3,
      lineHeight: '25px'
    }
  },
  warningIcon: {
    position: 'absolute',
    width: 16,
    bottom: -3,
    right: -6
  },
  arrowsShared: {
    width: 36,
    marginLeft: 4,
    marginRight: 4,
    cursor: 'pointer',
    [theme.breakpoints.down('lg')]: {
      width: 30
    },
    [theme.breakpoints.down('sm')]: {
      width: 24
    },
    '&:hover': {
      filter: 'brightness(2)'
    },
    transition: '300ms'
  },
  cover: {
    width: '100%',
    height: '100%',
    background: '#01051499',
    position: 'absolute',
    zIndex: 11,
    borderRadius: 10,
    backdropFilter: 'blur(1px)',
    top: 0
  },
  loader: {
    height: 100,
    width: 100,
    margin: 'auto'
  }
}))

export default useStyles
