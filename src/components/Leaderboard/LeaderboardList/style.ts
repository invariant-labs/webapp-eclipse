import { alpha } from '@mui/material'
import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  skeleton: {
    borderRadius: 24,
    opacity: 0.7,
    height: 1072,
    width: '100%',
    transform: 'translateY(0px)'
  },
  container: {
    width: '100%',
    borderRadius: '24px',
    maxHeight: 'fit-content',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    backgroundColor: `${colors.invariant.newDark} !important`
  },
  pagination: {
    padding: '20px 24px 10px 24px',
    maxWidth: '100%',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      padding: '20px 12px'
    }
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
  },
  loading: {
    width: 150,
    height: 150,
    margin: 'auto',
    position: 'absolute',
    zIndex: 3,
    transform: 'translate(-50%,-50%)',
    top: '50%',
    left: '50%'
  },
  loadingOverlay: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundColor: alpha(colors.invariant.newDark, 0.7),
      backdropFilter: 'blur(4px)',
      zIndex: 1,
      pointerEvents: 'none'
    }
  },
  loadingContent: {
    position: 'relative',
    zIndex: 0,
    animation: 'pulse 1.5s ease-in-out infinite',
    opacity: 0.7
  },
  pagerWrapper: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0 10px 0',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    },
    '& span': {
      color: colors.invariant.textGrey
    }
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.7
    },
    '50%': {
      opacity: 0.5
    },
    '100%': {
      opacity: 0.7
    }
  },
  listContainer: {
    '&:last-child': {
      background: 'red'
    }
  }
}))
