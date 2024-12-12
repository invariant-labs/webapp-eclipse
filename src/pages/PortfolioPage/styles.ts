import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => {
  return {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      backgroundColor: 'transparent',
      marginTop: 45,
      paddingInline: 94,
      minHeight: '70vh',

      [theme.breakpoints.down('lg')]: {
        paddingInline: 80
      },

      [theme.breakpoints.down('md')]: {
        paddingInline: 90
      },

      [theme.breakpoints.down('sm')]: {
        paddingInline: 8
      }
    },
    innerContainer: {
      maxWidth: 1072,

      [theme.breakpoints.down('md')]: {
        width: '100%'
      }
    }
  }
})

export default useStyles