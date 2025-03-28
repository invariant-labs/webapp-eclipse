import { alpha } from '@mui/material'
import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    flexDirection: 'column',
    maxWidth: 1072
  },
  pagination: {
    borderTop: `1px solid ${colors.invariant.light}`,
    height: 90,
    padding: '20px 24px 10px 0',
    maxWidth: '100%',
    backgroundColor: colors.invariant.component,
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      padding: '20px 8px'
    }
  },
  emptyContainer: {
    background: colors.invariant.component,
    borderBottom: `1px solid ${colors.invariant.light}`
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
    background: colors.invariant.component
  },
  emptyRowBorder: {
    height: 68,
    borderBottom: `1px solid ${colors.invariant.light}`
  }
}))
