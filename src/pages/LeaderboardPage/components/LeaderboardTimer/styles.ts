import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '32px',
    gap: '24px',
    width: '100%',
    maxWidth: '521px',
    minHeight: '216px',
    background: '#202946',
    borderRadius: '32px',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflow: 'hidden',
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
      gap: '20px',
      borderRadius: '24px',
      width: 'calc(100% - 32px)',
      margin: '0 16px'
    }
  },
  headerText: {
    width: '100%',
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '32px',
    lineHeight: '36px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    textShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
    margin: '0'
  },
  timerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    gap: '10px',
    width: '100%',
    minHeight: '92px',
    background: '#3A466B',
    borderRadius: '16px',
    boxSizing: 'border-box'
  },
  timerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    width: '100%',
    maxWidth: '447px',
    gap: 10
  },
  timerBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '60px',
    background: 'linear-gradient(360deg, #2EE09A 0%, #EF84F5 100%)',
    borderRadius: '14px'
  },
  timerNumber: {
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '48px',
    lineHeightStep: '36px',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    color: '#111931',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      fontSize: '24px'
    }
  },
  separator: {
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '48px',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    color: '#111931',
    padding: '0 2px'
  }
}))
export default useStyles
