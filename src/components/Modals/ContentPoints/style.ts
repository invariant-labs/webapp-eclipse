import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    header: {
      width: '100%',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      '& p': {
        textAlign: 'center',
        ...typography.heading2,
        color: colors.invariant.text
      },
      '& img': {
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: 12,
        cursor: 'pointer'
      }
    },

    paper: {
      background: `
      radial-gradient(49.85% 49.85% at 50% 100%, rgba(46, 224, 154, 0.25) 0%, rgba(46, 224, 154, 0) 75%),
      radial-gradient(50.2% 50.2% at 50% 0%, rgba(239, 132, 245, 0.25) 0%, rgba(239, 132, 245, 0) 75%),
      ${colors.invariant.component}
    `,
      gap: '32px',
      borderRadius: '24px',
      boxShadow: 'none',
      maxWidth: '622px',
      padding: '24px',
      margin: 0,
      [theme.breakpoints.down('sm')]: {
        padding: '24px 8px',
        width: '100%',
        margin: '0px 8px'
      }
    },
    description: {
      display: 'flex',

      '& p': {
        color: colors.invariant.textGrey,
        textAlign: 'left',
        fontWeight: 400,
        fontSize: '20px',
        lineHeight: '24px',
        letterSpacing: '-3%'
      }
    },
    allocationText: {
      ...typography.heading4,
      color: colors.invariant.text,
      marginBottom: '16px'
    },
    allocationSection: {
      display: 'flex',
      flexDirection: 'column',
      crollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    dateLabel: {
      color: colors.invariant.textGrey,
      fontWeight: 400,
      fontSize: '20px'
    },
    pointsLabel: {
      ...typography.heading4,
      color: colors.invariant.green,
      textAlign: 'right',
      paddingRight: '16px'
    },
    link: {
      color: colors.invariant.green
    },
    row: {
      '&:first-child': {
        borderTop: `1px solid ${colors.invariant.light}`,
        borderRadius: '11px 11px 0 0'
      },
      '&:last-child': {
        borderBottom: `1px solid ${colors.invariant.light}`,
        borderRadius: '0 0 11px 11px'
      },
      '&:nth-of-type(odd)': {
        background: `#111931CC`
      },
      '&:nth-of-type(even)': {
        background: `#11193180`
      },
      borderTop: `0.5px solid ${colors.invariant.light}`,
      borderBottom: `0.5px solid ${colors.invariant.light}`
    },
    innerRow: {
      height: '100%',
      paddingLeft: '16px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    button: {
      marginRight: '16px',
      minWidth: '134px',
      maxWidth: '134px',
      height: '36px',
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
      borderRadius: '8px',
      fontStyle: 'normal',

      textTransform: 'none',
      color: colors.invariant.dark,
      ...typography.heading4,
      '&:hover': {
        background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
      }
    },
    lockPositionClose: {
      position: 'absolute',
      right: 0,
      minWidth: 0,
      height: 20,
      '&:after': {
        content: '"\u2715"',
        fontSize: 22,
        position: 'absolute',
        color: 'white',
        top: '50%',
        right: '0%',
        transform: 'translateY(-50%)'
      }
    },
    lockPositionHeader: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '& h1': {
        ...typography.heading2,
        flex: 1,
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
          marginTop: 30
        }
      }
    }
  }
})

export default useStyles
