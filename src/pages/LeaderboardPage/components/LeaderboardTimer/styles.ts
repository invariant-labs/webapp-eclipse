import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '16px',
    gap: '16px',
    width: '100%',
    maxWidth: '1079px',
    minHeight: '336px',
    background: '#202946',
    borderRadius: '16px',
    margin: '0 auto',
    boxSizing: 'border-box',
    overflow: 'hidden',
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
      gap: '20px',
      borderRadius: '24px',
      width: 'calc(100% - 32px)',
      margin: '0 16px'
    },
    [theme.breakpoints.up('md')]: {
      padding: '32px',
      gap: '24px',
      borderRadius: '32px'
    }
  },
  headerText: {
    width: '100%',
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '24px',
    lineHeight: '1.2',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    textShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
    margin: '0',
    [theme.breakpoints.up('sm')]: {
      fontSize: '48px',
      lineHeight: '1.3'
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '64px',
      lineHeight: '1.4'
    }
  },
  timerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    gap: '10px',
    width: '100%',
    minHeight: '160px',
    background: '#3A466B',
    borderRadius: '16px',
    boxSizing: 'border-box',
    [theme.breakpoints.up('sm')]: {
      padding: '24px',
      minHeight: '180px',
      borderRadius: '24px'
    },
    [theme.breakpoints.up('md')]: {
      padding: '32px',
      minHeight: '212px',
      borderRadius: '32px'
    }
  },
  timerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    width: '100%',
    maxWidth: '951px',
    gap: '8px',
    [theme.breakpoints.up('sm')]: {
      gap: '12px'
    },
    [theme.breakpoints.up('md')]: {
      gap: '16px'
    }
  },
  timerBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '80px',
    background: 'linear-gradient(360deg, #2EE09A 0%, #EF84F5 100%)',
    borderRadius: '12px'
  },
  timerNumber: {
    fontFamily: 'Mukta',
    fontWeight: 700,
    fontSize: '48px',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '-0.03em',
    color: '#111931',
    whiteSpace: 'nowrap',

    [theme.breakpoints.up('xs')]: {
      fontSize: '35px'
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '40px'
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '90px',
      lineHeight: '100px'
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
    padding: '0 2px',
    [theme.breakpoints.up('sm')]: {
      fontSize: '84px'
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '128px',
      lineHeight: '72px'
    }
  }
}))
export default useStyles
