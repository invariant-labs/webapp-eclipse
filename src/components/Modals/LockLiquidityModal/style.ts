import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    popover: {
      [theme.breakpoints.down(671)]: {
        display: 'flex',
        marginLeft: 'auto',
        justifyContent: 'center',
        marginTop: 'auto'
      }
    },
    backgroundContainer: {
      background: colors.invariant.component,
      borderRadius: 20,
      width: 671,
      [theme.breakpoints.down(671)]: {
        maxWidth: '100vw'
      }
    },
    container: {
      width: '100%',
      overflow: 'hidden',
      padding: 24,
      background: colors.invariant.mixedLinearGradient,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: 32,

      '& .MuiCheckbox-root': {
        color: colors.invariant.Error,
        width: 'auto',
        marginLeft: 4,
        marginRight: 6
      },
      '& .MuiCheckbox-root.Mui-checked': {
        color: colors.invariant.Error
      }
    },
    lockWarningText: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textWrap: 'wrap',
      ...typography.body2,
      color: colors.invariant.Error
    },
    lockExplanation: {
      color: '#A9B6BF',
      ...typography.body2,
      textWrap: 'wrap'
    },
    lockParagraph: {
      marginBottom: 16,
      ...typography.body2
    },
    lockPositionHeader: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      '& h1': {
        ...typography.heading2,
        flex: 1,
        textAlign: 'center',
        [theme.breakpoints.down('sm')]: {
          marginTop: 30
        }
      }
    },
    lockPositionClose: {
      position: 'absolute',
      right: 0,
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
    paper: {
      background: 'transparent',
      boxShadow: 'none',
      maxWidth: 671,
      maxHeight: '100vh',
      '&::-webkit-scrollbar': {
        width: 6,
        background: colors.invariant.component
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.invariant.light,
        borderRadius: 6
      }
    },
    lockWarning: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 12,
      paddingLeft: 12,
      ...typography.body2,
      textTransform: 'none',
      background: colors.invariant.errorTransparent,
      border: `2px solid ${colors.invariant.Error}`,
      borderRadius: 8,
      minHeight: 40,
      width: '100%',
      letterSpacing: -0.03
    },
    confirmInputContainer: {
      border: `1px solid ${colors.invariant.light}`,
      borderRadius: 8,
      padding: 12,
      background: colors.invariant.component,
      '& p: first-of-type': {
        ...typography.body2,
        color: colors.invariant.textGrey
      },
      '& p: last-of-type': {
        ...typography.body2
      }
    },
    lockButton: {
      color: colors.invariant.black,
      ...typography.body1,
      textTransform: 'none',
      background: colors.invariant.pinkLinearGradientOpacity,
      marginTop: -8,
      borderRadius: 16,
      height: 46.5,
      width: '100%',
      letterSpacing: -0.03,

      '&:disabled': {
        background: colors.invariant.light,
        color: colors.invariant.newDark,

        '&:hover': { background: colors.invariant.light, color: colors.invariant.newDark }
      },
      '&:hover': {
        background: colors.invariant.pinkLinearGradient,
        boxShadow: `0 0 16px ${colors.invariant.pink}`,
        '@media (hover: none)': {
          background: colors.invariant.pinkLinearGradientOpacity,
          boxShadow: 'none'
        }
      }
    },
    positionDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    positionDetailsTitle: {
      color: '#A9B6BF',
      ...typography.body1
    },
    icon: {
      width: 40,
      borderRadius: '100%'
    },
    arrowIcon: {
      width: 32,
      marginRight: 4,
      marginLeft: 4,
      height: 32,
      borderRadius: '100%',
      padding: 4,
      '&:hover': {
        cursor: 'pointer',
        filter: 'brightness(2)',
        '@media (hover: none)': {
          filter: 'none'
        }
      }
    },
    name: {
      ...typography.heading2,
      color: colors.invariant.text,
      textWrap: 'nowrap',
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        ...typography.heading3
      }
    },
    pairInfo: {
      background: colors.invariant.newDark,
      width: '100%',
      padding: 12,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 12,
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column'
      }
    },
    pairDisplay: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      paddingTop: 8,
      paddingBottom: 8,
      flex: '0 0 auto'
    },
    tooltip: {
      color: colors.invariant.textGrey,
      ...typography.caption4,
      lineHeight: '24px',
      background: colors.black.full,
      borderRadius: 12
    },
    pairDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flex: 1,
      [theme.breakpoints.down('sm')]: {
        gap: 8,
        width: '100%'
      }
    },
    icons: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      margin: 0,
      height: 40,
      [theme.breakpoints.down('sm')]: {
        height: 22
      }
    },
    pairMinMax: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 36,
      borderRadius: 11,
      background: colors.invariant.light,
      padding: 8
    },
    pairValues: {
      display: 'flex',
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: 8
      }
    },
    pairFee: {
      flex: '0 1 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      background: colors.invariant.green,
      height: 36,
      color: colors.invariant.black,
      ...typography.body1,
      padding: '0 8px',
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    pairRange: {
      flex: '1 1 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      background: colors.invariant.light,
      height: 36,
      padding: '0 8px',
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        flex: '0 1 auto'
      }
    },
    pairValue: {
      flex: '1 1 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 11,
      background: colors.invariant.light,
      height: 36,
      padding: '0 8px',
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        flex: '0 1 auto'
      }
    },
    normalText: {
      color: colors.invariant.textGrey,
      ...typography.body1
    },
    greenText: {
      color: colors.invariant.green,
      ...typography.body1
    },
    inputWrapper: {
      position: 'relative',
      display: 'inline-block',
      height: 44,
      marginTop: 12,
      width: '100%'
    },
    placeholder: {
      position: 'absolute',
      height: '100%',
      top: 0,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      whiteSpace: 'pre',
      ...typography.body2
    },
    visibleInput: {
      width: '100%',
      position: 'absolute',
      height: '100%',
      top: 0,
      paddingLeft: 10,
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      whiteSpace: 'pre',
      borderRadius: 6,
      border: `1px solid ${colors.invariant.light}`,
      backgroundColor: colors.invariant.newDark,
      color: colors.white.main,
      ...typography.body2,

      '&:focus': {
        outline: 'none'
      }
    },
    hiddenInput: {
      width: '100%',
      height: 44,
      padding: 12,
      borderRadius: 6,
      border: `1px solid 'transparent'`,
      backgroundColor: 'transparent',
      caretColor: colors.white.main,
      color: 'transparent',
      ...typography.body2,

      '&::disabled': {
        color: colors.invariant.light,
        ...typography.body2
      },
      '&::placeholder': {
        color: colors.invariant.light,
        ...typography.body2
      },
      '&:focus': {
        outline: 'none'
      }
    },
    innerInput: {
      '&::disabled': {
        color: colors.invariant.light,
        ...typography.body2
      },
      '&::placeholder': {
        color: colors.invariant.lightHover,
        ...typography.body2
      },
      '&:focus': {
        outline: 'none'
      }
    },
    inputChar: {
      display: 'inline-block',
      whiteSpace: 'pre'
    }
  }
})

export default useStyles
