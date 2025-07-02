import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  container: {
    // maxWidth: '1072px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '24px',
    marginTop: '72px'
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
  }
}))

export default useStyles
