import { alpha } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1210
  },
  background: {},
  transparent: {
    backgroundColor: `transparent`
  },
  pagination: {
    padding: '20px 2 10px 0',
    maxWidth: '100%'
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
  tableFooter: {
    width: '100%',
    height: 24,
    borderTop: `2px solid ${colors.invariant.light}`,

    background: colors.invariant.component,
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px'
  }
}))
