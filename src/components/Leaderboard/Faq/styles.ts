import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    maxWidth: 1072,
    borderRadius: '24px',
    maxHeight: 'fit-content',
    position: 'relative',
    zIndex: 2,
    backgroundColor: `${colors.invariant.component} !important`,
    padding: '24px 32px',
    [theme.breakpoints.down('sm')]: {
      padding: '24px 12px'
    },

    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.light,
      borderRadius: '4px'
    }
  },
  item: {
    '& a': {
      color: '#2EE09A',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline'
      }
    },
    '& ul': {
      paddingLeft: theme.spacing(2),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    '& li': {
      marginBottom: theme.spacing(1)
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  }
}))
