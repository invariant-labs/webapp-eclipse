import { makeStyles } from '@material-ui/core'
import { colors } from '@static/theme'
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      alignItems: 'flex-start'
    }
  },
  uploadedImage: {
    borderRadius: 8,
    maxWidth: '100px'
  },
  imageContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    width: '100%'
  },
  imageButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.invariant.newDark,
    padding: 0,
    overflow: 'hidden',
    '&.selected': {
      backgroundColor: colors.invariant.light
    },
    '& img': {
      width: '70%',
      height: '70%',
      objectFit: 'cover'
    }
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.invariant.newDark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colors.invariant.light
    }
  },
  hiddenInput: {
    display: 'none'
  },
  uploadIcon: {
    fontSize: 20,
    color: colors.invariant.light
  }
}))
export default useStyles
