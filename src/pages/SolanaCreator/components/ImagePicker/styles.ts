import { lighten, makeStyles } from '@material-ui/core'
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
    maxWidth: '100px',
    width: '70%',
    height: '70%',
    objectFit: 'cover'
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&.selected': {
      backgroundColor: colors.invariant.light
    },
    '&:hover': {
      backgroundColor: colors.invariant.light
    },
    '& img': {
      width: '70%',
      height: '70%',
      objectFit: 'cover'
    }
  },
  hiddenInput: {
    display: 'none'
  },
  uploadIcon: {
    fontSize: 40,
    color: lighten(colors.invariant.light, 0.5)
  }
}))

export default useStyles