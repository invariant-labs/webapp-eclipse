import { Theme } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isEmpty: boolean }>()((_theme: Theme, { isEmpty }) => {
  return {
    paper: {
      position: 'relative',
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
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    dateLabel: {
      color: colors.invariant.textGrey,
      fontWeight: 400,
      fontSize: '20px',
      [theme.breakpoints.down('sm')]: {
        fontSize: '18px'
      }
    },
    pointsLabel: {
      ...typography.heading4,
      color: colors.invariant.green,
      textAlign: 'right',
      paddingRight: '16px'
    },
    link: {
      color: colors.invariant.green,
      textDecoration: 'none'
    },
    row: {
      '&:first-of-type': {
        borderTop: `1px solid ${colors.invariant.light}`
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
      width: '134px',

      height: '36px',
      background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)',
      borderRadius: '8px',

      [theme.breakpoints.down(375)]: {
        width: 94
      },
      textTransform: 'none',
      color: colors.invariant.dark,
      ...typography.heading4,
      '&:hover': {
        background: 'linear-gradient(180deg, #2EE09A 0%, #21A47C 100%)'
      }
    },
    lockPositionClose: {
      position: 'absolute',
      right: 20,
      top: 20,
      height: 15,
      cursor: 'pointer'
    },
    lockPositionHeader: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& h1': {
        ...typography.heading2,
        flex: 1,
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
          marginTop: 30
        }
      }
    },
    buttonRow: {
      height: 56,
      '&:nth-of-type(odd)': {
        background: `#111931CC`
      },
      '&:nth-of-type(even)': {
        background: `#11193180`
      },
      borderBottom: !isEmpty ? `0px` : `1px solid ${colors.invariant.light}`,
      borderTop: `1px solid ${colors.invariant.light}`,
      borderRadius: `${isEmpty ? '11px' : '11px 11px 0 0'}`,
      background: `#111931CC`
    },
    staticRow: {
      '&:last-child': {
        borderBottom: `1px solid ${colors.invariant.light}`
      },
      '&:nth-of-type(odd)': {
        background: `#111931CC`
      },
      '&:nth-of-type(even)': {
        background: `#11193180`
      },
      borderTop: `1px solid ${colors.invariant.light}`
    },
    contentSection: {
      borderRadius: '0 0 11px 11px',
      overflow: 'hidden'
    }
  }
})

export default useStyles
