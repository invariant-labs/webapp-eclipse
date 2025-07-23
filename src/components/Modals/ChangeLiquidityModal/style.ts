import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paper: {
    width: 'calc(100% - 48px)',
    background: colors.invariant.component,
    padding: 24,
    borderRadius: 24,
    boxShadow: 'none',
    maxWidth: 416,

    [theme.breakpoints.down('sm')]: {
      padding: 8
    }
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  switch: {
    background: colors.invariant.dark,
    padding: 2,
    display: 'flex',
    borderRadius: 13
  },
  switchButtonActive: {
    color: colors.invariant.text,
    background: colors.invariant.light,

    '&:hover': {
      background: colors.invariant.light
    }
  },
  switchButton: {
    ...typography.body1,
    width: '50%',
    color: colors.invariant.light,
    height: 40,
    display: 'flex',
    gap: 8,
    borderRadius: 11,
    textTransform: 'none',

    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  title: {
    ...typography.heading4
  },
  card: {
    background: colors.invariant.light,
    padding: 16,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  rowMobile: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: 8
    }
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  statMobile: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  },
  statTitle: {
    ...typography.caption2,
    color: colors.invariant.textGrey
  },
  statDescription: {
    ...typography.heading3,
    color: colors.invariant.text,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  statDescriptionMobile: {
    [theme.breakpoints.down('sm')]: {
      ...typography.caption1
    }
  },
  rangeContainer: {
    ...typography.caption4,
    background: '#FB555F40',
    paddingInline: 6,
    height: 20,
    borderRadius: 5,
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  },
  inRangeContainer: {
    background: '#2EE09A40'
  },
  depositRatioContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  },
  token: {
    height: 20,
    width: 20,
    borderRadius: '50%'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    ...typography.heading4
  },
  closeIconContainer: {
    height: 20,
    width: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  closeIcon: {
    height: 12,
    width: 12
  }
}))

export default useStyles
