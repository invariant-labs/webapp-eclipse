import { Theme } from '@mui/material'
import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    popover: {
      marginTop: 'max(calc(50vh - 247px), 0px)',
      marginLeft: 'calc(50vw - 279px)',
      [theme.breakpoints.down(671)]: {
        display: 'flex',
        marginLeft: 'auto',
        justifyContent: 'center',
        marginTop: 'auto'
      }
    },
    backgroundContainer: {
      background: colors.invariant.component,
      borderRadius: 24,
      width: 558,
      [theme.breakpoints.down(558)]: {
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
      gap: 24
    },
    infoContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 24
    },
    referrerContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 8
    },
    splittedContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 24,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column'
      },
      [theme.breakpoints.down(558)]: {
        maxWidth: 'calc(100vw-48px)'
      }
    },
    splittedContainerItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      justifyContent: 'center',
      alignItems: 'center',
      width: '45%'
    },
    divider: {
      border: '2px solid',
      borderColor: colors.invariant.light
    },
    referralModalHeader: {
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
    referralModalClose: {
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
      },
      '&:hover': {
        backgroundColor: '#1B191F'
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
    confirmButton: {
      color: colors.invariant.black,
      ...typography.body1,
      textTransform: 'none',
      background: colors.invariant.pinkLinearGradientOpacity,
      borderRadius: 16,
      height: 44,
      width: 185,
      '&:hover': {
        background: colors.invariant.pinkLinearGradient,
        boxShadow: `0 0 16px ${colors.invariant.pink}`,
        '@media (hover: none)': {
          background: colors.invariant.pinkLinearGradientOpacity,
          boxShadow: 'none'
        }
      }
    },
    buttonText: {
      WebkitPaddingBefore: '2px',
      [theme.breakpoints.down('sm')]: {
        WebkitPaddingBefore: 0
      }
    },
    greySmallText: {
      ...typography.body2,
      color: colors.invariant.textGrey
    },
    whiteSmallText: {
      ...typography.body2,
      color: colors.invariant.text
    },
    whiteBigText: { ...typography.heading4, color: colors.invariant.text }
  }
})

export default useStyles
