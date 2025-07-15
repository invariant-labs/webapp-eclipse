import { colors, theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    maxWidth: '467px',
    boxSizing: 'border-box',
    overflow: 'hidden'
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
    padding: '10px',
    width: '100%',
    minHeight: '112px',
    boxSizing: 'border-box',
    borderRadius: '34px',
    position: 'relative',
    background: 'linear-gradient(269.89deg, #EF84F5 0.89%, #2EE09A 99.11%)'
  },
  innerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    background: colors.invariant.newDark
  },
  timerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    width: '100%',
    maxWidth: '467px',
    gap: 10
  },
  timerBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '60px'
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
    color: colors.invariant.text,
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
    color: colors.invariant.text,
    padding: '0 2px'
  }
}))
export default useStyles
