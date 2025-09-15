import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    root: {
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    paper: {
      background: 'none',
      // backgroundColor: 'transparent',
      '& > *': {
        // backgroundColor: 'transparent'
      },

      [theme.breakpoints.down('sm')]: {
        top: '0 !important',
        left: '0 !important',
        margin: 0,
        maxWidth: '100%',
        maxHeight: '100%'
      }
    },
    tooltip: {
      color: colors.invariant.warning,
      ...typography.caption2,
      lineHeight: '16px',
      background: colors.invariant.component,
      borderRadius: 8
    },
    detailsWrapper: {
      width: 350,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.invariant.component,
      padding: 16,
      borderRadius: 20,
      color: colors.white.main,
      '& h2': {
        ...typography.heading4,
        paddingBottom: 10
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    closeModal: {
      position: 'absolute',
      right: 16,
      minWidth: 0,
      height: 20,
      '&:after': {
        content: '"\u2715"',
        fontSize: 22,
        position: 'absolute',
        color: 'white',
        top: '50%',
        right: '0%',
        transform: 'translateY(-50%)'
      }
    },
    label: {
      ...typography.body2,
      color: colors.invariant.lightHover,
      marginBottom: 8
    },
    headerText: {
      ...typography.heading4,
      color: colors.invariant.text
    },
    selectTokenClose: {
      minWidth: 0,
      background: 'none',
      '&:hover': {
        background: 'none !important'
      },
      cursor: 'pointer',
      '&:after': {
        content: '"\u2715"',
        fontSize: 20,
        position: 'absolute',
        color: colors.white.main,
        top: '40%',
        right: '10%',
        transform: 'translateY(-50%)'
      }
    },
    detailsInfoTextContainer: {
      height: 85
    },
    detailsInfoForm: {
      marginTop: 6,
      border: `1px solid ${colors.invariant.component}`,
      color: colors.invariant.textGrey,
      borderRadius: 15,
      width: '100%',
      backgroundColor: colors.invariant.newDark,
      ...typography.heading4,
      fontWeight: 400,
      padding: 8,
      '&::placeholder': {
        color: colors.invariant.light
      },
      '&:focus': {
        outline: 'none'
      },
      transition: '0.3s',

      '&:hover': {
        backgroundColor: colors.invariant.light,
        color: colors.invariant.text
      },
      '&:focus-within': {
        backgroundColor: colors.invariant.light,
        color: colors.invariant.text
      }
    },
    headerContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    },
    optionsContainer: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column'
    },
    innerInput: {
      paddingBlock: 0,
      textAlign: 'right'
    },
    setAsDefaultBtn: {
      width: '100%',
      height: 44,
      color: colors.invariant.newDark,
      backgroundColor: `${colors.invariant.green} !important`,
      textTransform: 'none',
      textDecoration: 'none',
      borderRadius: 16,
      cursor: 'pointer',
      ...typography.body1,
      '&:hover': {
        backgroundColor: `${colors.invariant.green} !important`,
        filter: 'brightness(1.15)',
        transition: ' .4s filter',
        boxShadow:
          '0px 3px 1px -2px rgba(43, 193, 144, 0.2),0px 1px 2px 0px rgba(45, 168, 128, 0.14),0px 0px 5px 7px rgba(59, 183, 142, 0.12)',
        '@media (hover: none)': {
          filter: 'none',
          boxShadow: 'none'
        }
      }
    },
    detailsInfoBtn: {
      minWidth: 49,
      backgroundColor: colors.invariant.green,
      borderRadius: 9,
      border: 'none',
      padding: 4,
      width: 49,
      height: 28,
      cursor: 'pointer',
      marginLeft: 8,
      color: colors.invariant.black,
      letterSpacing: '-0.03%',
      ...typography.body2,
      '&:hover': {
        filter: 'brightness(1.15)',
        transition: ' .4s filter',
        boxShadow:
          '0px 3px 1px -2px rgba(43, 193, 144, 0.2),0px 1px 2px 0px rgba(45, 168, 128, 0.14),0px 0px 5px 7px rgba(59, 183, 142, 0.12)',
        '@media (hover: none)': {
          filter: 'none',
          boxShadow: 'none'
        }
      }
    },
    info: {
      ...typography.caption2,
      color: colors.invariant.textGrey,
      marginTop: 10
    },
    slippagePercentageButton: {
      minWidth: 100,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.invariant.newDark,
      color: colors.invariant.textGrey,
      flex: 1,
      letterSpacing: '-0.03%',
      '&:hover': {
        backgroundColor: colors.invariant.light,
        color: colors.invariant.text,
        '@media (hover: none)': {
          backgroundColor: colors.invariant.newDark,
          color: colors.invariant.textGrey
        }
      }
    },
    slippagePercentageButtonActive: {
      backgroundColor: `${colors.invariant.light} !important`,
      color: `${colors.invariant.text} !important`,
      fontWeight: 'bold !important'
    },
    inputAdornedEnd: {
      marginRight: 2
    },
    inputAdornedStart: {
      color: colors.invariant.pink
    },
    customSlippageActive: {
      border: `1px solid ${colors.invariant.component}`,
      backgroundColor: colors.invariant.light,
      color: colors.invariant.text,
      fontWeight: 'bold'
    },
    divider: {
      width: '100%',
      borderBottom: `1px solid ${colors.invariant.light}`,
      marginTop: 9.5,
      marginBottom: 9.5
    },
    grayscaleIcon: {
      filter: 'grayscale(100%)',
      transition: 'filter 0.7s ease-in-out',
      minWidth: '8px',
      minHeight: '8px'
    },
    switchSettingsTypeContainer: {
      marginTop: 10,
      position: 'relative',
      width: '100%',
      backgroundColor: colors.invariant.dark,
      borderRadius: 10,
      overflow: 'hidden',
      display: 'inline-flex',
      height: 32,
      [theme.breakpoints.down('sm')]: {
        height: 48
      }
    },
    switchSettingsTypeMarker: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      backgroundColor: colors.invariant.light,
      borderRadius: 10,
      transition: 'all 0.3s ease',
      zIndex: 1
    },
    switchSettingsTypeButtonsGroup: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      width: '100%'
    },
    switchSettingsTypeButton: {
      ...typography.caption1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      textTransform: 'none',
      border: 'none',
      borderRadius: 10,
      zIndex: 2,
      '&.Mui-selected': {
        backgroundColor: 'transparent'
      },
      '&:hover': {
        backgroundColor: 'transparent'
      },
      '&.Mui-selected:hover': {
        backgroundColor: 'transparent'
      },
      '&:disabled': {
        color: colors.invariant.textGrey,
        fontWeight: 200,
        pointerEvents: 'auto',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 'none',
          cursor: 'not-allowed',
          filter: 'brightness(1.15)',
          '@media (hover: none)': {
            filter: 'none'
          }
        }
      },
      letterSpacing: '-0.03em',
      height: 32,
      [theme.breakpoints.down('sm')]: {
        height: 48
      }
    },
    switchSelected: { color: colors.invariant.text, fontWeight: 700 },
    switchNotSelected: { color: colors.invariant.text, fontWeight: 400 },
    defaultOptionsContainer: {
      display: 'flex',
      gap: 9
    },
    singleOption: {
      display: 'flex',
      flexWrap: 'nowrap',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      gap: 2
    },
    singleOptionValue: {
      fontWeight: 700,
      fontSize: 14,
      marginTop: -8
    },
    singleOptionTooltipContainer: {
      ...typography.caption2,
      color: colors.invariant.warning,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexDirection: 'row',
      justifyContent: 'center'
    },
    singleOptionTooltipIcon: {
      width: 12,
      height: 12
    },
    singleOptionMessageContainer: {
      width: 141
    },
    labelInfoItem: {
      width: 8,
      marginTop: 0,
      marginLeft: 2
    },
    singleItemLabel: {
      textWrap: 'nowrap',
      fontWeight: 400,
      fontSize: 10,
      letterSpacing: '-0.03%',
      textTransform: 'none',
      marginLeft: -4
    }
  }
})

export default useStyles
