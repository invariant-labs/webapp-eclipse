import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(_theme => {
  return {
    tooltipWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 8,
      '& img': {
        width: 50,
        borderRadius: '6px'
      }
    },
    separator: {
      height: '2px',
      width: '100%',
      background: colors.invariant.light
    },
    newTabIcon: {
      width: 14,
      height: 14,
      marginLeft: -10,
      marginBottom: 2
    },
    link: {
      display: 'flex',
      pointerEvents: 'auto',
      ...typography.body2,
      color: colors.invariant.text,
      alignItems: 'center'
    },
    title: {
      width: 237,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      '& p': {
        ...typography.heading4,
        color: colors.invariant.text
      }
    },
    progressWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      '& p': {
        ...typography.body2,
        color: colors.invariant.textGrey
      },
      '& img': {
        width: 24
      }
    },
    footer: {
      display: 'flex',
      alignItems: 'center',

      padding: '4px 8px',
      '& p': {
        ...typography.body2,
        color: colors.invariant.text
      },
      '& img': {
        minWidth: 14,
        minHeight: 20,
        marginRight: 6
      }
    },
    description: {
      ...typography.body2,
      color: colors.invariant.textGrey
    }
  }
})

export default useStyles
