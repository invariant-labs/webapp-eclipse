import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  },
  background: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'max(2400px, 100%)',
    height: '100%',
    zIndex: -1,
    background: `
      radial-gradient(circle at 700px 800px, rgba(58, 70, 107, 0.3) 0, transparent 400px),
      radial-gradient(circle at 100px 900px, rgba(58, 70, 107, 0.2) 0, transparent 600px),
      radial-gradient(circle at 1600px 500px, rgba(58, 70, 107, 0.3) 0, transparent 400px),
      radial-gradient(circle at 1600px 1600px, rgba(58, 70, 107, 0.4) 0, transparent 800px),
      radial-gradient(circle at 500px 2000px, rgba(58, 70, 107, 0.3) 0, transparent 400px),
      radial-gradient(circle at -100px 3000px, rgba(58, 70, 107, 0.3) 0, transparent 900px),
      radial-gradient(circle at 1600px 2500px, rgba(58, 70, 107, 0.4) 0, transparent 600px),
      radial-gradient(circle at 2000px 3600px, rgba(58, 70, 107, 0.4) 0, transparent 1200px)
    `,
    backgroundColor: '#12182b',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    pointerEvents: 'none'
  },
  body: {
    flex: 1,
    marginTop: '65px',
    [theme.breakpoints.down('sm')]: {
      marginTop: '24px',
      overflowX: 'hidden'
    }
  }
}))

export default useStyles
