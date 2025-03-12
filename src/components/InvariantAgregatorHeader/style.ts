import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '12px',
      minHeight: '56px',
      background: colors.invariant.dark,
      borderRadius: '24px',
      gap: '8px',
      border: `2px solid ${colors.invariant.light}`,
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: '10px',
        padding: '16px 12px',
        height: 'auto'
      }
    },
    header_logo_wrapper: {
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        marginBottom: '8px'
      }
    },
    item_wrapper: {
      width: '75%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'space-around'
      }
    },
    item: {
      height: '56px',
      width: '56px',
      borderRadius: '100%',
      background: `${colors.invariant.component}`,
      border: `2px solid ${colors.invariant.light}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        height: '48px',
        width: '48px'
      },
      '& img': {
        maxWidth: '70%',
        maxHeight: '70%',
        objectFit: 'contain'
      }
    }
  }
})

export default useStyles
