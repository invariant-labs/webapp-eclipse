import { colors, typography } from '@static/theme'
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
      margin: 0
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
        width: '6px'
      },
      '&::-webkit-scrollbar-track': {
        background: colors.invariant.newDark
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.invariant.pink,
        borderRadius: '3px'
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
      paddingRight: '10px'
    }
  }
})

export default useStyles
