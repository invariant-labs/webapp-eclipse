import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    backgroundContainer: {
      background: colors.invariant.component,
      maxWidth: 519,
      display: 'flex',
      flexDirection: 'row',
      gap: 16,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      [theme.breakpoints.down(671)]: {
        width: '100%'
      }
    },
    sectionTitle: {
      color: colors.invariant.pink,
      ...typography.caption1
    },
    standardText: {
      color: colors.invariant.textGrey,
      ...typography.caption2
    },
    listText: {
      color: colors.invariant.green,
      ...typography.caption1
    },
    explanationContainer: {
      display: 'flex',
      width: 310,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 8,
      flexDirection: 'column',
      [theme.breakpoints.down(671)]: {
        width: '100%'
      }
    },
    errorText: {
      color: colors.invariant.Error,
      ...typography.caption1
    },
    halfContainer: {
      display: 'flex',
      width: '50%',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 8,
      flexDirection: 'column',
      [theme.breakpoints.down(671)]: {
        width: '100%'
      }
    },
    promotedSwapsContainer: {
      display: 'flex',
      width: 137,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 8,
      flexDirection: 'column',
      [theme.breakpoints.down(671)]: {
        width: '100%'
      }
    }
  }
})

export default useStyles
