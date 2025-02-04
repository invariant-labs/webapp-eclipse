import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    minWidth: '47%',

    [theme.breakpoints.down('lg')]: {
      maxHeight: 'fit-content'
    },
    backgroundColor: colors.invariant.component,

    borderTopLeftRadius: '24px',
    borderBottomLeftRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      borderRadius: '24px',
      padding: '0px 16px 0px 16px'
    },
    borderRight: `1px solid  ${colors.invariant.light}`,
    padding: '0px 24px 0px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
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
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap'
    },
    flexWrap: 'nowrap',
    alignItems: 'center',
    minHeight: '32px'
  },
  unclaimedTitle: {
    ...typography.heading4,
    color: colors.invariant.text
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
