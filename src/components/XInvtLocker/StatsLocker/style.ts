import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 510,
    width: '100%',

    '& h5': {
      ...typography.heading4,
      color: colors.invariant.text,
      marginBottom: 12
    }
  },
  statsWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    boxSizing: 'border-box',
    maxWidth: 510,
    width: '100%',
    gap: 20,
    padding: 24,
    borderRadius: 24,

    background: colors.invariant.component,
    '& h5': {
      display: 'flex',
      alignItems: 'center',
      ...typography.heading4,
      lineHeight: 1,

      color: colors.invariant.text,
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    [theme.breakpoints.down('sm')]: {
      padding: '8px',
      '&:not(:last-child)': {
        marginBottom: 12
      }
    }
  },
  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between'
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
    [theme.breakpoints.down('sm')]: {
      height: 80
    },
    '& h3': {
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey,
      [theme.breakpoints.down('sm')]: {
        ...typography.caption2
      }
    },
    '& h2': {
      ...typography.heading2,
      color: colors.invariant.text,
      [theme.breakpoints.down('sm')]: {
        ...typography.heading3
      }
    }
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
    [theme.breakpoints.down('sm')]: {
      height: 80
    },
    '& h3': {
      fontWeight: 400,
      fontSize: '20px',
      lineHeight: '28px',
      letterSpacing: '-3%',
      color: colors.invariant.textGrey,
      [theme.breakpoints.down('sm')]: {
        ...typography.caption2
      }
    },
    '& h2': {
      ...typography.heading2,
      color: colors.invariant.text,
      [theme.breakpoints.down('sm')]: {
        ...typography.heading3
      }
    }
  },
  globalStatsBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    height: 95,
    [theme.breakpoints.down('sm')]: {
      height: 80
    },
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
      color: colors.invariant.textGrey,
      [theme.breakpoints.down('sm')]: {
        ...typography.caption2
      }
    },
    '& h2': {
      ...typography.heading2,
      color: colors.invariant.text,

      [theme.breakpoints.down('sm')]: {
        ...typography.heading3
      }
    }
  },

  lockPeriod: {
    display: 'flex',
    // background: colors.invariant.newDark,
    border: `1px solid ${colors.invariant.light}`,
    justifyContent: 'center',
    padding: '8px 24px',
    borderRadius: 24,
    gap: 4,
    flex: 1,
    alignItems: 'center',
    '& span': {
      [theme.breakpoints.down('sm')]: {
        ...typography.caption4
      }
    },
    '& p': { [theme.breakpoints.down('sm')]: { ...typography.caption3 } },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center'
    }
  },
  mobileStatsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    '& h5': {
      ...typography.heading4,
      color: colors.invariant.text
    }
  }
}))

export default useStyles
