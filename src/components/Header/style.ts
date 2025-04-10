import { Theme } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      margin: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'nowrap',
      maxWidth: 1920,
      height: 70,
      display: 'flex',
      justifyContent: 'space-between',
      paddingInline: 24,

      [theme.breakpoints.down('sm')]: {
        paddingInline: 8
      }
    },
    logo: {
      width: 150,
      height: 40,
      flexShrink: 0,

      '&:hover': {
        cursor: 'pointer'
      }
    },
    logoShort: {
      minWidth: 40,
      height: 30,
      marginRight: 8,
      [theme.breakpoints.up(650)]: {
        display: 'none'
      },
      [theme.breakpoints.down('sm')]: {
        marginRight: 0
      },

      '&:hover': {
        cursor: 'pointer'
      }
    },
    routers: {
      backgroundColor: colors.invariant.black,
      borderRadius: '10px',
      flexWrap: 'nowrap',
      transition: 'left 300ms',
      width: 'fit-content',
      margin: '0 10px 0 10px'
    },
    connectedWalletIcon: {
      minWidth: 21,
      height: 21,
      marginRight: 0,
      color: colors.invariant.green,
      '& >circle': {
        boxShadow: '0px 0px 10px rgba(157, 212, 109, 0.5)'
      }
    },
    buttons: {
      display: 'flex',
      width: 'auto',
      justifyContent: 'flex-end',
      gap: 12,
      flexWrap: 'nowrap',
      alignItems: 'center',
      [theme.breakpoints.up(1450)]: {
        flex: '1 1 0%'
      },

      [theme.breakpoints.down('md')]: {
        marginLeft: 0,
        width: '100%',
        justifyContent: 'center'
      },

      [theme.breakpoints.down('sm')]: {
        justifyContent: 'space-between',
        gap: 0
      }
    },
    leftButtons: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.invariant.component,
      borderRadius: 14,
      width: 'auto',
      padding: 4
    },
    buttonsLgConnected: {
      [theme.breakpoints.up('lg')]: {
        minWidth: 433
      }
    },
    link: {
      textDecoration: 'none',
      minWidth: 'fit-content'
    },
    menu: {
      width: 40,
      height: 25,
      transition: 'filter 300ms'
    },
    menuButton: {
      width: 142,
      display: 'flex',
      justifyContent: 'flex-end',
      borderRadius: 10,
      paddingInline: 6,
      paddingBlock: 1,
      height: 45,
      transition: 'background 300ms',
      marginLeft: 8,
      '&:hover': {
        background: 'transparent'
      },
      '&:hover $menu': {
        filter: 'brightness(2)'
      },

      [theme.breakpoints.down('md')]: {
        width: 40
      }
    },
    leftSide: {
      width: 'auto',
      justifyContent: 'flex-start',
      [theme.breakpoints.down(650)]: {
        display: 'none'
      },

      [theme.breakpoints.up(1450)]: {
        flex: '1 1 0%'
      }
    }
  }
})

export default useStyles
