import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    statsWrapper: {
      display: 'flex',
      maxWidth: 500,
      width: '100%',
      padding: 24,
      borderRadius: 24,
      gap: 5,
      marginTop: 24,
      flexDirection: 'column',
      background: colors.invariant.component,
      justifyContent: 'space-between'
    },
    rowWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '& h1': {
        ...typography.body2,
        textAlign: 'left',
        alignSelf: 'flex-start',
        whiteSpace: 'nowrap',
        color: colors.invariant.textGrey
      },
      '& h2': {
        marginLeft: 8,
        display: 'flex',
        ...typography.body1,
        textAlign: 'right',
        whiteSpace: 'wrap'
      }
    },
    tooltipWrapper: {
      display: 'flex',
      flexShrink: 0,
      alignItems: 'center',
      gap: 4,
      flexWrap: 'nowrap',
      '& img': {
        opacity: 0.6,
        width: 12,
        height: 12,
        marginBottom: 2
      }
    }
  }
})

export default useStyles
