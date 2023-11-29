import { makeStyles, Theme } from '@material-ui/core/styles'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles<Theme, { open: boolean }>(() => ({
  wrapper: ({ open }) => ({
    borderRadius: 10,
    padding: 0,
    background: colors.invariant.newDark,
    overflow: 'hidden',
    transition: 'max-height 300ms',
    maxHeight: open ? 160 : 0,
    marginBottom: 16
  }),
  innerWrapper: {
    padding: 16,
    minHeight: 132
  },
  row: {
    '&:not(:last-child)': {
      marginBottom: 8
    }
  },
  label: {
    ...typography.body1,
    color: colors.white.main,
    marginRight: 3
  },
  value: {
    ...typography.body2,
    color: colors.white.main
  },
  loadingContainer: {
    width: 20,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  loading: {
    width: 15,
    height: 15
  }
}))
