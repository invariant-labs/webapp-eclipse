import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    width: '697px',
    minHeight: '280px',
    backgroundColor: colors.invariant.component,
    borderRadius: '24px',
    padding: '24px'
  },
  subtitle: {
    ...typography.body2,
    color: colors.invariant.textGrey
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerText: {
    ...typography.heading1,
    color: colors.invariant.text,
    marginTop: '12px'
  },
  unclaimedSection: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '32px'
  },
  unclaimedTitle: {
    ...typography.heading4,
    color: colors.invariant.text,
    marginTop: '12px'
  },
  unclaimedAmount: {
    ...typography.heading3,
    color: colors.invariant.text,
    marginRight: '16px'
  },
  claimAllButton: {
    ...typography.body1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '130px',
    height: '32px',
    background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
    borderRadius: '12px',
    fontFamily: 'Mukta',
    fontStyle: 'normal',
    textTransform: 'none',
    color: colors.invariant.dark,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(46, 224, 154, 0.35)'
    },
    '&:active': {
      transform: 'translateY(1px)',
      boxShadow: '0 2px 8px rgba(46, 224, 154, 0.35)'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}))
