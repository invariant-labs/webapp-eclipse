import { makeStyles, Theme } from '@material-ui/core/styles'
import { colors, typography } from '@static/theme'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 508,
    position: 'relative'
  },
  header: {
    ...typography.body1,
    color: colors.white.main,
    marginBottom: 10
  },
  title: {
    ...typography.heading3,
    color: colors.white.main,
    marginLeft: 10,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tile: {
    marginBottom: 20
  },
  containers: {
    marginTop: 20,
    minHeight: 250
  },
  bigIcon: {
    minWidth: 32,
    height: 32,
    borderRadius: '100%'
  },
  smallIcon: {
    minWidth: 17,
    height: 17,
    marginRight: 5,
    borderRadius: '100%'
  },
  positionInfo: {
    flexWrap: 'nowrap',
    marginBottom: 16,

    [theme.breakpoints.down('xs')]: {
      flexWrap: 'wrap'
    }
  },
  leftSide: {
    marginRight: 8,
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      marginBottom: 8
    }
  },
  rightSide: {
    '& $row': {
      justifyContent: 'flex-end',

      [theme.breakpoints.down('xs')]: {
        justifyContent: 'flex-start'
      }
    }
  },
  row: {
    '&:not(:last-child)': {
      marginBottom: 8
    }
  },
  label: {
    marginRight: 5,
    ...typography.body2,
    color: colors.invariant.textGrey,
    whiteSpace: 'nowrap',
    display: 'flex',
    flexShrink: 0
  },
  value: {
    ...typography.body1,
    color: colors.white.main,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  back: {
    height: 40,
    marginBottom: 16,
    width: 'fit-content',
    transition: 'filter 300ms',

    '&:hover': {
      filter: 'brightness(2)'
    }
  },
  backIcon: {
    width: 22,
    height: 24,
    marginRight: 12
  },
  backText: {
    color: 'rgba(169, 182, 191, 1)',
    WebkitPaddingBefore: '2px',
    ...typography.body2
  },
  listHeader: {
    color: colors.white.main,
    ...typography.heading4,
    marginBottom: 12,
    width: '100%'
  },
  empty: {
    marginBlock: 20
  },
  arrows: {
    minWidth: 32,
    marginLeft: 4,
    marginRight: 4,
    cursor: 'pointer',
    filter: 'brightness(0.7)',

    '&:hover': {
      filter: 'brightness(2)'
    }
  },
  loading: {
    width: 20,
    height: 20
  },
  noWalletEmpty: {
    marginTop: 80
  }
}))

export default useStyles
