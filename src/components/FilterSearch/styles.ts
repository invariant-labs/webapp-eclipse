import { Theme } from '@mui/material'
import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ fullWidth: boolean }>()((theme: Theme, { fullWidth }) => ({
  searchBar: {
    height: 32,
    borderRadius: 10,
    marginBottom: 8,
    background: colors.invariant.black,
    border: '1px solid #202946',
    color: colors.invariant.light,
    transition: 'width 0.3s ease-in-out',
    width: fullWidth ? 424 : 221
  },
  searchIcon: {
    width: 17
  },

  searchResultIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: '50%'
  },
  paper: {
    background: colors.invariant.bodyBackground,
    boxShadow: 'none',
    minWidth: 424,
    width: 424,
    maxHeight: '100vh',
    marginTop: 20,
    '&::-webkit-scrollbar': {
      width: 6,
      background: colors.invariant.component
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.light,
      borderRadius: 6
    }
  },
  avatarChip: {
    width: 14,
    height: 14,
    borderRadius: '50%'
  },
  typographyChip: {
    ...typography.body2,
    color: colors.invariant.text
  },
  boxChip: {
    display: 'flex',
    padding: '6px 4px 6px 4px',
    borderRadius: 8,
    gap: 6,

    height: 26,
    maxHeight: 26,
    justifyContent: 'center',
    alignItems: 'center',
    background: colors.invariant.component
  },
  closeIcon: {
    cursor: 'pointer',
    transition: 'opacity 0.2s ease-in-out',
    '&:hover': {
      opacity: 0.7
    }
  }
}))

export default useStyles
