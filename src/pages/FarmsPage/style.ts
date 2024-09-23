import { makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    minHeight: '70vh',
    marginTop: 97,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingInline: 94,
    maxWidth: '100%',

    [theme.breakpoints.down('md')]: {
      paddingInline: 80
    },

    [theme.breakpoints.down('sm')]: {
      paddingInline: 90
    },

    [theme.breakpoints.down('xs')]: {
      paddingInline: 16
    }
  }
}))

export default useStyles
