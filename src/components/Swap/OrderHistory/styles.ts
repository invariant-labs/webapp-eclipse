import { alpha } from '@mui/material'
import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    maxWidth: 510,
    marginTop: 24,

    [theme.breakpoints.down('sm')]: {
      marginInline: 8
    }
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  tableHeader: {
    width: '100%',
    height: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  refreshIcon: {
    width: 26,
    height: 21,
    cursor: 'pointer',
    transition: 'filter 300ms',
    '&:hover': {
      filter: 'brightness(1.5)',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  refreshIconBtn: {
    padding: 0,
    margin: 0,
    minWidth: 'auto',
    background: 'none',
    '&:hover': {
      background: 'none'
    },
    '&:disabled': {
      opacity: 0.5
    }
  },
  listContainer: {
    background: colors.invariant.component,
    borderRadius: 24,
    width: '100%',
    minHeight: 100,
    overflow: 'hidden'
  },
  ordersNumber: {
    width: 28,
    height: 28,
    color: colors.invariant.text,
    background: colors.invariant.light,
    marginLeft: 8,
    borderRadius: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flexDirection: 'column',
    maxWidth: 1210,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    backgroundColor: colors.invariant.component,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
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
      pointerEvents: 'none'
    }
  },
  loadingOverlayHeader: {
    position: 'relative',
    borderBottomLeftRadius: 'none',
    borderBottomRightRadius: 'none',

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    overflow: 'hidden',
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
  emptyRow: {
    height: 79,
    background: colors.invariant.component,
    boxSizing: 'border-box'
  }
}))
