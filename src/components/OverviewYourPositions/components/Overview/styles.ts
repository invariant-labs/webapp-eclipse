import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'

export const useStyles = makeStyles()(() => ({
  container: {
    width: '600px',
    backgroundColor: colors.invariant.component,

    borderTopLeftRadius: '24px',
    borderBottomLeftRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      borderRadius: '24px',
      maxHeight: 'fit-content',
      width: 'auto',
      padding: '0px 16px 0px 16px'
    },
    borderRight: `1px solid  ${colors.invariant.light}`,
    padding: '0px 24px 0px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  tooltip: {
    color: colors.invariant.textGrey,
    ...typography.caption4,
    lineHeight: '24px',
    background: colors.black.full,
    boxShadow: `0 0 15px ${colors.invariant.light}`,
    borderRadius: 12
  },
  subtitle: {
    ...typography.body2,
    color: colors.invariant.textGrey,
    [theme.breakpoints.down('lg')]: {
      marginTop: '16px'
    }
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerText: {
    [theme.breakpoints.down('lg')]: {
      marginTop: '16px'
    },
    ...typography.heading1,
    color: colors.invariant.text
  },

  unclaimedSection: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '32px',

    [theme.breakpoints.up('lg')]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',

    [theme.breakpoints.up('lg')]: {
      gap: 'auto',
      flex: 1,
      justifyContent: 'space-between'
    }
  },

  unclaimedTitle: {
    ...typography.heading4,
    color: colors.invariant.textGrey
  },

  unclaimedAmount: {
    ...typography.heading3,
    color: colors.invariant.text
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

    [theme.breakpoints.down('lg')]: {
      width: '100%'
    },

    '&:disabled': {
      background: colors.invariant.light,
      color: colors.invariant.dark
    }
  }
}))
