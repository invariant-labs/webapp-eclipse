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
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: '50%'
  },
  paper: {
    width: 392,
    boxShadow: 'none',
    maxWidth: 392,
    padding: '16px 16px 10px 16px',

    marginTop: 8,
    background: colors.invariant.bodyBackground,
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
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 10,
    padding: 2
  },
  headerText: {
    ...typography.body2,
    color: colors.invariant.textGrey
  },
  commonTokens: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  divider: {
    background: colors.invariant.light,
    height: 1,
    width: 'fullWidth'
  },
  tokenContainer: {
    width: '100%',
    display: 'flex',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    padding: '8px',
    '&:hover': {
      background: colors.invariant.greenLinearGradientOpacity
    }
  },
  tokenLabel: {
    ...typography.heading3
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 4px 2px 4px'
  },
  addressLabel: {
    ...typography.caption4,
    color: colors.invariant.textGrey
  },
  tokenName: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  balaceLabel: {
    ...typography.body2,
    color: colors.invariant.textGrey
  }
}))

export default useStyles
