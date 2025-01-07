import { Theme } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useMobileStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: 16,
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
      padding: 8
    },
    background: colors.invariant.component,
    borderRadius: 24,
    '&:not(:last-child)': {
      marginBottom: 20
    },
    '&:hover': {
      background: `${colors.invariant.component}B0`
    }
  },
  actionButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  minMax: {
    background: colors.invariant.light,
    borderRadius: 11,
    height: 36,
    paddingInline: 10,
    width: '100%',
    marginRight: 0,
    marginTop: '8px'
  },
  mdInfo: {
    flexWrap: 'wrap',
    width: '100%'
  },
  mdTop: {
    justifyContent: 'space-between',
    width: '100%'
  },
  iconsAndNames: {
    display: 'flex'
  }
}))
