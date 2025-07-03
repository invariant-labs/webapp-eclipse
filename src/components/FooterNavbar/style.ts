import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    activeLink: {
      background: colors.invariant.blue
    },
    navbar: {
      display: 'flex',
      width: '100%',
      height: '65px',
      background: colors.invariant.component,
      borderTop: `2px solid ${colors.invariant.light}`,
      marginTop: '12px',
      position: 'sticky',
      bottom: 0,
      zIndex: 100
    },
    navbox: {
      maxHeight: 65,
      textDecoration: 'none',
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',

      gap: '8px',
      alignItems: 'center',
      padding: '10px 0',
      borderRight: `1px solid ${colors.invariant.light}`,
      cursor: 'pointer',

      '& p': {
        ...typography.tiny1,
        fontSize: 12,
        fontWeight: 600
      },
      ':last-child': {
        borderRight: 'none'
      }
    },
    navImg: {
      filter: 'brightness(0) saturate(100%) invert(45%)'
    },
    activeBox: {
      position: 'absolute',
      width: '100%',
      padding: '0 1px 0 1px',
      height: 2,
      top: -2,
      left: -1,
      background: colors.invariant.pinkGreenLinearGradient,

      '&:last-of-type': {
        padding: '0 0 0 1px'
      }
    },
    paper: {
      background: 'transparent',
      boxShadow: 'none'
    },
    root: {
      background: colors.invariant.component,
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      width: 150,
      padding: '12px 24px',
      justifyContent: 'center'
    },
    moreLink: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '11px',

      borderRadius: 18,
      '&:hover': {
        backgroundColor: colors.invariant.light
      },
      '& p': {
        marginTop: 5,
        ...typography.body2,
        color: colors.invariant.text
      }
    }
  }
})

export default useStyles
