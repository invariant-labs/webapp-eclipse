import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    marginTop: 24,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  }
}))

export default useStyles
