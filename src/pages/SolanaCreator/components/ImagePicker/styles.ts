import { lighten, Theme } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      alignItems: 'flex-start'
    }
  },
  errorMessage: {
    color: colors.invariant.Error,
    fontSize: 13,
    marginTop: 4,
    width: '100%'
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
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    width: '100%',
    marginBottom: theme.spacing(1)
  },
  placeholderIcon: {
    fontSize: 48,
    color: colors.invariant.lightGrey
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
    }
  },
  hiddenInput: {
    display: 'none'
  },
  uploadIcon: {
    fontSize: 30,
    color: lighten(colors.invariant.light, 0.5)
  },
  uploadButton: {
    width: '100%',
    backgroundColor: colors.invariant.newDark,
    color: colors.invariant.light,
    '&:hover': {
      backgroundColor: lighten(colors.invariant.newDark, 0.1)
    }
  }
}))

export default useStyles
