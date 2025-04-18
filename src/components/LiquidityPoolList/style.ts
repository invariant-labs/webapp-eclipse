import { alpha } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ initialDataLength: number }>()(
  (_theme, { initialDataLength }) => ({
    container: {
      maxWidth: 1072,
      borderRadius: '24px'
    },
    pagination: {
      padding: '20px 24px 10px 24px',
      maxWidth: '100%',
      backgroundColor: colors.invariant.component,
      borderBottomLeftRadius: '24px',
      borderBottomRightRadius: '24px'
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
      height: initialDataLength > 10 ? 68 : 69
    },
    emptyWrapper: {
      background: colors.invariant.component
    }
  })
)
