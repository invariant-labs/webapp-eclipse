import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ percentage: number; isActive: boolean }>()(
  (theme, { percentage, isActive }) => ({
    container: {
      [theme.breakpoints.up('lg')]: {
        minWidth: '380px'
      },
      width: '100%'
    },

    roundTitleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    roundText: {
      fontSize: 24,
      lineHeight: '28px',
      letterSpacing: '-3%',
      fontWeight: 400,
      color: colors.invariant.textGrey
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
      height: isActive ? '56px' : 'auto',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      ...(!isActive
        ? {
            borderRadius: 12
          }
        : {})
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

      borderRadius: 8,
      transition: 'width 0.3s'
    },
    activeProgress: {
      background: `linear-gradient(270deg, #2EE09A 0%, rgba(46, 224, 154, 0.75) 55%)`,
      boxShadow: `0px 0px 20px 0px ${colors.invariant.green}55`
    },
    inactiveProgress: {
      background: `#A9B6BF80`
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
      color: colors.invariant.text,
      justifyContent: 'space-between',
      alignItems: 'center',
      background: colors.invariant.component,
      padding: '12px',
      height: '20px',
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
      height: '24px',
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
      display: 'flex',
      alignItems: 'center',
      gap: '1px',
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
    },
    alertBox: {
      border: `2px solid ${colors.invariant.green}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '12px',
      marginTop: '24px',
      padding: '10px',
      backgroundColor: '#2EE09A33'
    },
    alertBoxContent: {
      display: 'flex',
      width: '100%',
      gap: '8px',
      alignItems: 'center',
      justifyContent: 'center'
    },
    alertBoxText: {
      color: colors.invariant.green,
      ...typography.body2
    },
    closeIconContainer: {
      height: 24,
      width: 24,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer'
    },
    closeIcon: {
      height: 12,
      width: 12
    }
  })
)

export default useStyles
