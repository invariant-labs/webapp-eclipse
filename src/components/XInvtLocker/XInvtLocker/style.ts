import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  wrapper: {
    maxWidth: 510,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    background: colors.invariant.component,
    borderRadius: 24,
    flex: 1,
    padding: 24,
    [theme.breakpoints.down('sm')]: {
      padding: '12px 8px'
    }
  },
  title: {
    color: colors.invariant.text,
    ...typography.heading4
  },

  swapButton: {
    marginTop: 24,
    width: '100%',
    height: 48
  },
  ButtonSwapActive: {
    transition: 'filter 0.3s linear',
    background: `${colors.invariant.greenLinearGradient} !important`,
    filter: 'brightness(0.8)',
    '&:hover': {
      filter: 'brightness(1.15)',
      boxShadow:
        '0px 3px 1px -2px rgba(43, 193, 144, 0.2),0px 1px 2px 0px rgba(45, 168, 128, 0.14),0px 0px 5px 7px rgba(59, 183, 142, 0.12)'
    }
  },
  lockPeriod: {
    display: 'flex',
    background: colors.invariant.newDark,
    padding: '8px 6px',
    borderRadius: 8,
    gap: 4,
    alignItems: 'center'
  },
  timerWrapper: {
    border: `1px solid ${colors.invariant.warning}`,
    padding: '12px 8px',
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
}))

export default useStyles
