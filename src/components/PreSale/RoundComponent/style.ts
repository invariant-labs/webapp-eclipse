import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ percentage: number; isActive: boolean }>()(
  (theme, { percentage, isActive }) => ({
    container: {
      minWidth: '380px'
    },

    roundTitle: {
      ...typography.heading2,
      color: colors.invariant.text,
      textAlign: 'center'
    },

    progressCard: {
      borderRadius: '12px',
      marginTop: '24px'
    },
    progressHeader: {
      background: colors.invariant.light,
      padding: '12px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px'
    },

    darkBackground: {
      marginTop: 8,
      marginBottom: 8,
      width: '100%',
      height: '16px',
      backgroundColor: colors.invariant.dark,
      borderRadius: 8
    },
    gradientProgress: {
      width: `${percentage}%`,
      height: '16px',
      background: colors.invariant.pinkGreenLinearGradient,
      borderRadius: 8,
      transition: 'width 0.3s'
    },
    barWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1)
    },
    amountBought: {
      ...typography.caption2,
      color: colors.invariant.text
    },
    amountLeft: {
      ...typography.caption1,
      color: colors.invariant.text
    },

    priceIncreaseBox: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: colors.invariant.component,
      padding: '12px',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px'
    },
    priceIncreaseText: {
      ...typography.body2,
      display: 'flex',
      gap: '4px',
      color: colors.invariant.textGrey
    },

    infoCard: {
      background: isActive ? colors.invariant.component : 'transparent',
      padding: '12px',
      borderRadius: '12px',
      marginTop: '24px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    divider: {
      height: '1px',
      margin: '16px 0',
      width: '100%',
      background: colors.invariant.light
    },

    infoLabel: {
      color: colors.invariant.text,
      ...typography.body2
    },
    infoLabelBigger: {
      color: colors.invariant.text,
      fontSize: '20px',
      lineHeight: '24px',
      fontWeight: 400
    },
    secondaryLabel: {
      color: colors.invariant.textGrey,
      ...typography.body2
    },
    currentPrice: {
      color: colors.invariant.pink,
      ...typography.body1
    },
    currentPriceBigger: {
      color: colors.invariant.pink,
      fontSize: '20px',
      lineHeight: '24px',
      fontWeight: 400
    },
    nextPrice: {
      color: colors.invariant.green,
      ...typography.body1
    },
    value: {
      color: colors.invariant.text,
      ...typography.body1
    },

    sliderLabel: {
      display: 'flex',
      ...typography.caption1,
      color: colors.invariant.textGrey
    }
  })
)

export default useStyles
