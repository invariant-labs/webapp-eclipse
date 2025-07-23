import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ percentage: number; isActive?: boolean }>()(
  (theme, { percentage, isActive }) => ({
    wrapper: {
      width: 'fit-content',
      [theme.breakpoints.down('lg')]: {
        width: '100%'
      }
    },
    greenButton: {
      background: colors.invariant.greenLinearGradient,
      color: colors.invariant.newDark,
      backgroundHover: colors.invariant.greenLinearGradient,
      boxShadow: 'rgba(46, 224, 154, 0.5)'
    },
    presaleEnded: {
      marginTop: 10,
      width: '100%',
      height: '100%',
      ...typography.heading3,
      color: colors.invariant.text,
      textAlign: 'center'
    },
    skeletonBanner: {
      height: 74,
      marginTop: -16,
      borderRadius: '12px'
    },
    blocker: {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 11,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(11, 12, 13, 0.88)',
      filter: 'blur(4px) brightness(0.4)',
      borderRadius: 20
    },
    container: {
      backgroundColor: colors.invariant.component,
      borderRadius: '20px',
      width: '520px',
      [theme.breakpoints.down('lg')]: {
        width: 'calc(100% - 48px)'
      },
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      [theme.breakpoints.down('sm')]: {
        padding: '16px 8px',
        width: 'calc(100% - 16px)'
      }
    },

    alerBoxGreen: {
      border: `2px solid ${colors.invariant.green}`,
      backgroundColor: '#2EE09A33',
      '& p': {
        color: colors.invariant.green
      }
    },
    alertBoxYellow: {
      border: `2px solid ${colors.invariant.yellow}`,
      backgroundColor: '#EFD06333',
      '& p': {
        color: colors.invariant.yellow
      }
    },
    alertBox: {
      display: 'flex',
      borderRadius: '12px',
      marginBottom: '16px',
      padding: '10px',
      alignItems: 'center',
      justifyContent: 'center'
    },
    alertBoxText: {
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
      height: 44,
      display: 'flex',
      width: '100%',
      paddingBottom: '8px',
      marginBottom: '16px',
      justifyContent: 'space-between',
      flexShrink: 0,
      alignItems: 'center'
    },
    tooltipBox: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 12,
      gap: 10
    },
    egibilityCheckerText: {
      color: colors.invariant.text,
      textAlign: 'left',
      ...typography.body2,
      marginRight: '16px',
      [theme.breakpoints.down('md')]: {
        marginRight: '0px'
      },
      [theme.breakpoints.down('sm')]: {
        textWrap: 'wrap'
      },
      [theme.breakpoints.down(392)]: {
        maxWidth: 150
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
      marginTop: '16px',
      color: colors.invariant.text,
      '& h4': {
        ...typography.heading4,
        [theme.breakpoints.down(352)]: {
          fontSize: 18
        }
      }
    },
    presaleTitle: {
      width: '100%',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...typography.heading4,
      color: colors.invariant.text
    },
    pinkText: {
      color: colors.invariant.pink
    },
    greenText: {
      color: colors.invariant.green
    },
    raisedInfo: {
      display: 'flex',
      height: '24px',
      marginTop: '16px',
      gap: '6px',
      ...typography.body2,
      color: colors.invariant.text
    },
    raisedAfterEnd: {
      height: '24px',
      marginTop: '16px',
      color: colors.invariant.textGrey,
      ...typography.heading4
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
    colorSliderLabel: {
      display: 'flex',
      ...typography.body1,
      color: colors.invariant.green
    },
    barWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(1)
    },
    timerContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 10,
      paddingInline: 0,
      flexDirection: 'column',
      width: '100%'
    },
    barContainer: {
      height: 49
    },
    sectionDivider: {
      height: '1px',
      width: '100%',
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
      position: 'relative',
      marginTop: '12px',
      height: '32px',
      justifyContent: 'space-between',
      padding: '13px',
      alignItems: 'center',
      borderRadius: '16px',
      background: isActive
        ? `linear-gradient(90deg, rgba(17, 25, 49, 0.2) 0%, rgba(239, 132, 245, 0.2) 100%), #111931;`
        : colors.invariant.dark
    },
    receiveLabel: {
      ...typography.body3,
      color: colors.invariant.textGrey
    },
    tokenAmount: {
      ...typography.heading2,
      color: colors.invariant.text
    },
    link: {
      ...typography.body2,
      color: colors.invariant.green,
      textDecoration: 'underline',
      cursor: 'pointer',
      textAlign: 'center'
    }
  })
)

export default useStyles
