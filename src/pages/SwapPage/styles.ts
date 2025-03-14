import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      minHeight: '60vh',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      maxWidth: '100%'
    }
  }
})

export default useStyles
