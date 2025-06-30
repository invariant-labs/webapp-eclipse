import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    paper: {
      background: `
      radial-gradient(49.85% 49.85% at 50% 100%, rgba(46, 224, 154, 0.25) 0%, rgba(46, 224, 154, 0) 75%),
      radial-gradient(50.2% 50.2% at 50% 0%, rgba(239, 132, 245, 0.25) 0%, rgba(239, 132, 245, 0) 75%),
      ${colors.invariant.component}
    `,
      justifyContent: 'space-between',
      borderRadius: '24px',
      boxShadow: 'none',
      maxWidth: '500px',
      minHeight: '180px',
      width: '100%',
      padding: '24px',
      gap: 16,
      margin: 0,
      '& h2': {
        ...typography.heading3
      },
      '& p': {
        ...typography.body2
      },
      [theme.breakpoints.down('sm')]: {
        padding: '24px 8px',
        width: '100%',
        margin: '0px 8px'
      }
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }
})

export default useStyles
