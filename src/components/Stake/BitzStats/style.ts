import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    width: '100%',
    gap: 24,

    [theme.breakpoints.down('md')]: {
      gap: 0,
      flexDirection: 'column'
    }
  }
}))

export default useStyles
