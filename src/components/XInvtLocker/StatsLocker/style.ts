import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  statsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    height: 480,
    maxWidth: 510,
    width: '100%',
    gap: 20,
    padding: 24,
    borderRadius: 24,

    background: colors.invariant.component,
    '& h5': {
      ...typography.heading4,
      color: colors.invariant.text
    },
    [theme.breakpoints.down('sm')]: {
      background: colors.invariant.component,
      gap: 0,
      justifyContent: 'space-between',
      padding: '12px 0',
      height: 'auto'
    }
  },
  yourStatsBoxesWrapper: {
    display: 'flex',
    gap: 20
  },
  statsBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: 95,
    width: '100%',
    maxWidth: 242,
    gap: 12,
    border: `1px solid ${colors.invariant.light}`,
    borderRadius: 24,
    '& h3': {
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey
    },
    '& h2': { ...typography.heading2, color: colors.invariant.text }
  },
  singleBoxStat: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: 95,
    width: '100%',
    maxWidth: 504,
    gap: 12,
    borderRadius: 24,
    background: colors.invariant.newDark,
    '& h3': {
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey
    },
    '& h2': { ...typography.heading2, color: colors.invariant.text }
  },
  globalStatsBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: 95,
    width: '100%',
    maxWidth: 242,
    gap: 12,
    borderRadius: 24,
    background: colors.invariant.newDark,
    '& h3': {
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey
    },
    '& h2': { ...typography.heading2, color: colors.invariant.text }
  },
  mobileStatsBox: {
    padding: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.invariant.light}`,
    '&:last-child': {
      borderBottom: 'none'
    },
    '& h4': {
      color: colors.invariant.textGrey,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      fontWeight: 400
    },
    '& h2': {
      ...typography.heading2,
      color: colors.invariant.text
    }
  }
}))

export default useStyles
