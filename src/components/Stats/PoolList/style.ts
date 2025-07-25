import { alpha } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(_theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 72,

    [theme.breakpoints.down('md')]: {
      marginTop: 24
    }
  },
  headerContainer: {
    display: 'flex',
    width: 'auto',
    gap: 14
  },
  subheader: {
    ...typography.heading4,
    color: colors.white.main,
    display: 'flex'
  },
  container: {
    flexDirection: 'column',
    maxWidth: 1210,
    flexWrap: 'nowrap',
    // position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.invariant.component,
    borderRadius: '24px'
  },
  pagination: {
    maxWidth: '100%',
    backgroundColor: colors.invariant.component,
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px'
  },
  emptyContainer: {
    background: colors.invariant.component,
    borderBottom: `2px solid ${colors.invariant.light}`,
    boxSizing: 'border-box'
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
      pointerEvents: 'none',
      borderRadius: '24px'
    }
  },
  emptyRow: {
    height: 69,
    background: colors.invariant.component,
    boxSizing: 'border-box'
  },
  rowContainer: {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },

  showFavouritesButton: {
    height: 40,
    background: colors.invariant.component,
    padding: '6px 8px',
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textTransform: 'none',
    width: 155,
    textAlign: 'right',

    '&:hover': {
      background: colors.invariant.componentDark,
      boxShadow: 'none'
    },

    '& .MuiTouchRipple-root .MuiTouchRipple-child': {
      backgroundColor: colors.invariant.lightGrey
    },

    [theme.breakpoints.down('sm')]: {
      minWidth: 40,
      width: 40
    }
  },
  showFavouritesText: {
    ...typography.body2,
    color: colors.invariant.textGrey,
    marginTop: 2,
    width: 108
  },
  sortWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    margin: '16px 8px'
  }
}))
