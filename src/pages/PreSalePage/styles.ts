// import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => {
  return {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingInline: 94,
      minHeight: '60vh',

      [theme.breakpoints.down('lg')]: {
        paddingInline: 80
      },

      [theme.breakpoints.down('md')]: {
        paddingInline: 90
      },

      [theme.breakpoints.down('sm')]: {
        paddingInline: 8
      }
    }
  }
})
export default useStyles
