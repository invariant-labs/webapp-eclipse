import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    container: {
      display: 'flex',
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      paddingInline: 200,
      [theme.breakpoints.down('lg')]: {
        paddingInline: 40
      },
      [theme.breakpoints.down('md')]: {
        paddingInline: 20
      },
      [theme.breakpoints.down('sm')]: {
        paddingInline: 8
      }
    }
  }
})

export default useStyles
