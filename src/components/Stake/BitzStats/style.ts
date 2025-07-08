import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    width: '100%',
    maxHeight: 280,
    gap: 24,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      maxHeight: '1000px'
    }
  }
}))

export default useStyles
