import { alpha } from '@mui/material'
import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    flexDirection: 'column',
    maxWidth: 1072,
    flexWrap: 'nowrap'
  },
  pagination: {
    height: 90,
    borderTop: `1px solid ${colors.invariant.light}`,
    padding: '20px 24px 10px 0',
    maxWidth: '100%',
    backgroundColor: colors.invariant.component,
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('lg')]: {
      padding: '20px 8px'
    }
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

export default useStyles
