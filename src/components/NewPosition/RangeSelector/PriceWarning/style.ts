import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    priceWarning: {
      display: 'inline-block',
      color: colors.invariant.Error,
      ...typography.body2,
      marginLeft: 4,
      fontSize: 14
    },
    priceWarningIcon: {
      width: 16,
      height: 16,
      flexShrink: 0,
      marginBottom: 2
    },
    priceWarningContainer: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 1,
      marginTop: 2
    },

    tooltipContainer: {
      maxWidth: 512
    },
    suggestedPriceTooltipText: {
      color: colors.invariant.text,
      ...typography.caption2,
      fontWeight: 200
    },
    boldedText: { fontWeight: 800 }
  }
})

export default useStyles
