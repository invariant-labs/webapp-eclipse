import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  arcContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  heading: {
    ...typography.heading4,
    color: colors.invariant.text,
    marginBottom: '16px'
  },
  textContainer: {
    marginLeft: '24px'
  },
  pieChartSection: {
    flex: '1 1 100%',
    minHeight: 'fit-content',
    [theme.breakpoints.down('lg')]: {
      marginTop: '100px'
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
    padding: '24px',
    borderRadius: '16px',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statsLabel: {
    ...typography.body1,
    color: colors.invariant.textGrey
  },
  statsValue: {
    ...typography.heading1,
    color: colors.invariant.text
  },
  flexBoxWithGap: {
    display: 'flex',
    gap: '24px'
  },
  tokenTextContainer: {
    color: colors.invariant.text
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
