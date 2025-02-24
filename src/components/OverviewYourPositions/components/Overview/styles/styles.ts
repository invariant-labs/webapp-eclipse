import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'
import { Theme } from '@mui/material'

export const useStyles = makeStyles<{ isLoading: boolean }>()(
  (_theme: Theme, { isLoading = false }) => ({
    container: {
      width: '600px',
      backgroundColor: colors.invariant.component,
      borderTopLeftRadius: '24px',

      [theme.breakpoints.down('lg')]: {
        borderTopRightRadius: '24px',
        borderRight: `none`,
        maxHeight: 'fit-content',
        width: 'auto',
        padding: '0px 16px 0px 16px'
      },
      [theme.breakpoints.down('md')]: {
        borderRadius: 24
      },
      borderRight: `1px solid  ${colors.invariant.light}`,
      display: 'flex',
      flexDirection: 'column'
    },
    tooltip: {
      color: colors.invariant.text,
      width: '150px',
      background: colors.invariant.componentDark,
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
      alignItems: 'center',
      [theme.breakpoints.up('lg')]: {
        padding: '16px 24px'
      },
      padding: '16px 0px',

      justifyContent: 'space-between'
    },
    headerText: {
      ...typography.heading2,
      color: colors.invariant.text
    },
    pieChartSection: {
      flex: '1 1 100%',
      minHeight: 'fit-content',
      [theme.breakpoints.down('lg')]: {
        marginTop: '100px'
      }
    },
    legendSection: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row-reverse',
      [theme.breakpoints.down('lg')]: {
        justifyContent: 'center',
        flexDirection: 'column'
      }
    },
    unclaimedSection: {
      display: 'flex',

      flexDirection: 'column',
      gap: '16px',
      minHeight: '32px',

      [theme.breakpoints.up('lg')]: {
        height: '57.5px',
        padding: '0px 24px 0px 24px',
        borderTop: `1px solid  ${colors.invariant.light}`,
        borderBottom: `1px solid  ${colors.invariant.light}`,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    },

    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'space-between',

      [theme.breakpoints.up('lg')]: {
        gap: 'auto',
        flex: 1
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

    segmentBox: {
      height: '100%',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      gap: '16px',
      backgroundColor: colors.invariant.component,
      background:
        'linear-gradient(360deg, rgba(32, 41, 70, 0.8) 0%, rgba(17, 25, 49, 0.8) 100%), linear-gradient(180deg, #010514 0%, rgba(1, 5, 20, 0) 100%)'
    },
    emptyStateText: {
      ...typography.heading2,
      color: colors.invariant.text,
      textAlign: 'center'
    },
    claimAllButton: {
      ...typography.body1,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: '100px',
      height: '32px',
      marginLeft: '36px',
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
      borderRadius: '12px',
      fontFamily: 'Mukta',
      fontStyle: 'normal',
      textTransform: 'none',
      color: colors.invariant.dark,
      transition: 'all 0.3s ease',

      '&:hover': {
        background: 'linear-gradient(180deg, #3FF2AB 0%, #25B487 100%)',
        boxShadow: isLoading ? 'none' : '0 4px 15px rgba(46, 224, 154, 0.35)'
      },

      '&:active': {
        boxShadow: isLoading ? 'none' : '0 2px 8px rgba(46, 224, 154, 0.35)'
      },

      [theme.breakpoints.down('lg')]: {
        width: '100%',
        marginLeft: 0
      },

      '&:disabled': {
        background: colors.invariant.light,
        color: colors.invariant.dark
      }
    }
  })
)
