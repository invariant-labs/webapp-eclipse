import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 24
  },
  infoContainer: {
    width: '100vw',
    minHeight: '445px',
    padding: '32px 24px',
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(90deg, rgba(17, 25, 49, 0.1) 0%, #111931 29.21%, #111931 71%, rgba(17, 25, 49, 0.1) 100%);',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  contentWrapper: {
    display: 'flex'
  },
  stepperContainer: {
    display: 'flex',
    marginRight: '24px',
    minWidth: '440px'
  },
  roundComponentContainer: {
    height: '100%',
    marginLeft: '55px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}))
