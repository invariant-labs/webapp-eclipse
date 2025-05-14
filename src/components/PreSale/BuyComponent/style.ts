import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ percentage: number; isActive?: boolean }>()(
  (theme, { percentage, isActive }) => ({
    greenButton: {
      background: colors.invariant.greenLinearGradient,
      color: colors.invariant.newDark,
      backgroundHover: colors.invariant.greenLinearGradient,
      boxShadow: 'rgba(46, 224, 154, 0.5)'
    },
    container: {
      backgroundColor: colors.invariant.component,
      borderRadius: '20px',
      [theme.breakpoints.down('lg')]: {
        width: 'calc(100% - 48px)'
      },
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    alertBox: {
      width: '100%',
      border: `2px solid ${colors.invariant.green}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '12px',
      marginBottom: '16px',
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
    },
    paymentSelected: {
      border: `2px solid ${colors.invariant.green}`
    },
    egibilityCheckerWrapper: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      paddingBottom: '8px',
      marginBottom: '16px',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${colors.invariant.light}`
    },
    egibilityChecker: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    egibilityCheckerText: {
      color: colors.invariant.text,
      ...typography.body2,
      whiteSpace: 'nowrap',
      marginRight: '16px',
      width: '70%',
      [theme.breakpoints.down('md')]: {
        marginRight: '0px',
        whiteSpace: 'normal'
      }
    },

    headingContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'column',
      ...typography.heading4
    },
    titleText: {
      display: 'flex',
      gap: '6px',
      color: colors.invariant.text
    },
    pinkText: {
      color: colors.invariant.pink,
      ...typography.heading4
    },
    headingText: {
      ...typography.heading4
    },
    greenText: {
      color: colors.invariant.green,
      ...typography.heading4
    },
    raisedInfo: {
      display: 'flex',
      marginTop: '16px',
      gap: '6px',
      ...typography.body2,
      color: colors.invariant.text
    },
    greyText: {
      color: colors.invariant.textGrey,
      ...typography.body2
    },
    greenBodyText: {
      color: colors.invariant.green,
      ...typography.body2
    },
    darkBackground: {
      marginTop: 8,
      marginBottom: 8,
      width: '100%',
      height: 24,
      backgroundColor: colors.invariant.dark,
      borderRadius: 8
    },
    gradientProgress: {
      width: `${percentage}%`,
      height: 24,
      background: colors.invariant.pinkGreenLinearGradient,
      borderRadius: 8,
      transition: 'width 0.3s'
    },
    sliderLabel: {
      display: 'flex',
      ...typography.caption1,
      color: colors.invariant.textGrey
    },
    barWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1)
    },
    sectionDivider: {
      borderTop: `1px solid ${colors.invariant.light}`
    },
    sectionHeading: {
      ...typography.heading4,
      color: colors.invariant.text,
      textAlign: 'left'
    },
    paymentOptions: {
      display: 'flex',
      gap: '24px',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      '&:hover': {
        cursor: 'pointer'
      }
    },
    paymentOption: {
      display: 'flex',
      width: '50%',
      border: `2px solid transparent`,
      alignItems: 'center',
      borderRadius: '12px',
      padding: '13px',
      backgroundColor: colors.invariant.dark
    },
    paymentOptionIcon: {
      marginRight: '12px'
    },
    tokenIcon: {
      marginRight: '12px',
      maxWidth: '24px',
      maxHeight: '24px'
    },
    paymentOptionText: {
      ...typography.body2,
      color: colors.invariant.text
    },
    inputContainer: {
      backgroundColor: colors.invariant.dark,
      borderRadius: '20px',
      padding: '5px'
    },
    receiveBox: {
      display: 'flex',
      marginTop: '12px',
      justifyContent: 'space-between',
      padding: '13px',
      alignItems: 'center',
      borderRadius: '16px',
      background: isActive
        ? `linear-gradient(90deg, rgba(17, 25, 49, 0.2) 0%, rgba(239, 132, 245, 0.2) 100%), #111931;`
        : colors.invariant.dark
    },
    receiveLabel: {
      ...typography.caption2,
      color: colors.invariant.textGrey
    },
    tokenAmount: {
      ...typography.heading2,
      color: colors.invariant.text
    }
  })
)

export default useStyles
