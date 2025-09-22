import { Theme } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles<{ isSmall: boolean }>()((_theme: Theme, { isSmall }) => ({
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
  innerContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  timerBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmall ? '' : '60px',
    flex: 1
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
  },
  smallText: {
    ...typography.body1,
    color: colors.invariant.text
  }
}))
export default useStyles
