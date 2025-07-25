import { alpha } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(_theme => ({
  container: {
    flexDirection: 'column',
    maxWidth: 1210,
    flexWrap: 'nowrap',
    position: 'relative',
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
  }
}))
