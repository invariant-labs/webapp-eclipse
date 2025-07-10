import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  wrapper: {
    marginTop: 24,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  upperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  }
}))

export default useStyles
