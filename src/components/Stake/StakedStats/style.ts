import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    // maxWidth: '1072px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '24px',
    marginTop: '32px'
  },
  heading: {
    ...typography.heading4,
    color: colors.invariant.text,
    marginBottom: '16px'
  },
  contentBox: {
    backgroundColor: colors.invariant.component,
    borderRadius: '24px',
    display: 'flex',
    padding: '24px',
    marginTop: 2
  },
  contentBoxDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: '0'
  },
  contentBoxMobile: {
    flexDirection: 'column',
    gap: '24px'
  },
  sectionContainer: {
    width: '100%'
  },
  statsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    width: '100%'
  },
  textContainer: {},
  statsTitle: {
    ...typography.body2,
    color: colors.invariant.textGrey
  },
  statsValue: {
    ...typography.heading1,
    color: colors.invariant.text
  },
  iconContainer: {},
  tokenIcon: {
    width: '32px',
    height: '32px',
    marginRight: '8px'
  },
  chartContainer: {},
  separatorDesktop: {
    margin: '0 24px'
  },
  separatorMobile: {
    margin: '0 0px'
  },
  arcContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  pieChartSection: {
    flex: '0 0 200px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    [theme.breakpoints.down('lg')]: {
      flex: '0 0 160px',
      marginTop: '20px'
    },
    [theme.breakpoints.down('md')]: {
      flex: '0 0 140px',
      marginTop: '16px'
    },
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
      width: '100%',
      height: '180px',
      marginTop: '16px',
      marginBottom: '8px'
    }
  },
  statsContainer: {
    maxWidth: '550px',
    marginTop: '32px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  statsBox: {
    display: 'flex',
    backgroundColor: colors.invariant.component,
    borderRadius: '16px',
    alignItems: 'stretch',
    gap: '24px',
    [theme.breakpoints.down('md')]: {
      gap: '16px'
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'center'
    }
  },
  statsContent: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '24px',
    minHeight: '200px',
    [theme.breakpoints.down('md')]: {
      gap: '16px',
      minHeight: '180px'
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: 'auto'
    }
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tokenArcsSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsLabel: {
    ...typography.body1,
    color: colors.invariant.textGrey
  },
  flexBoxWithGap: {
    display: 'flex',
    gap: '48px',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      gap: '32px'
    },
    [theme.breakpoints.down('sm')]: {
      gap: '24px'
    }
  },
  tokenTextContainer: {
    color: colors.invariant.text,
    textAlign: 'center'
  },
  tokenName: {
    ...typography.heading3
  },
  tokenPercentageBlue: {
    ...typography.heading4,
    color: '#00D9FF'
  },
  tokenPercentageGreen: {
    ...typography.heading4,
    color: '#32EC51'
  }
}))

export default useStyles
