import { alpha } from '@mui/material'
import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    paper: {
      position: 'relative',
      alignItems: 'center',
      background: `
      radial-gradient(49.85% 49.85% at 50% 100%, rgba(46, 224, 154, 0.25) 0%, rgba(46, 224, 154, 0) 75%),
      radial-gradient(50.2% 50.2% at 50% 0%, rgba(239, 132, 245, 0.25) 0%, rgba(239, 132, 245, 0) 75%),
      ${colors.invariant.component}
    `,
      borderRadius: '24px',
      boxShadow: 'none',
      maxWidth: 695,

      width: '100%',
      padding: '24px',
      margin: 0,
      '& h2': {
        ...typography.heading2,
        marginBottom: 32
      },
      '& p': {
        ...typography.body3,
        color: colors.invariant.textGrey,
        marginBottom: 32,
        [theme.breakpoints.down('sm')]: {
          fontSize: 16
        }
      },
      [theme.breakpoints.down('sm')]: {
        padding: '24px 8px',
        width: '100%',
        margin: '0px 8px'
      }
    },
    buttonRow: {
      marginTop: 24,
      display: 'flex',
      width: '100%',
      gap: 8
    },
    closeButton: {
      width: 14,
      position: 'absolute',
      right: 25,
      top: 25,
      cursor: 'pointer'
    },
    unknownWarning: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      minHeight: 44,
      width: '100%',
      background: alpha(colors.invariant.Error, 0.2),
      border: `1px solid ${colors.invariant.Error}`,
      ...typography.caption2,
      paddingInline: 12,
      borderRadius: 9,
      '& span': {
        color: colors.invariant.Error,
        ...typography.body2
      },
      [theme.breakpoints.down(475)]: {
        height: 60
      }
    },
    warningIcon: {
      minWidth: 20
    }
  }
})

export default useStyles
