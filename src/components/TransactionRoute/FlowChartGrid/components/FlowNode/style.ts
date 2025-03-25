import { makeStyles } from 'tss-react/mui'
import { colors, typography } from '@static/theme'

export const useStyles = makeStyles()(_theme => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
      position: 'relative'
    },
    nodeBase: {
      display: 'flex',
      backgroundColor: colors.invariant.component,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      zIndex: 10,
      gap: '6px',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    },
    dexInfoContainer: {
      fontFamily: 'Mukta',
      fontStyle: 'normal',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      letterSpacing: '-0.03em',
      color: 'white'
    },
    dexLogo: {
      marginRight: '8px',
      width: '100%',
      height: 'auto',
      maxWidth: '18px',
      maxHeight: '21px'
    },
    dexFee: {
      ...typography.caption3
    },
    dexLink: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    dexLinkText: {
      ...typography.caption4,
      color: colors.invariant.textGrey,
      textDecoration: 'underline'
    },
    dexLinkIcon: {
      marginLeft: '4px',
      width: 8,
      height: 8
    },
    labelContainer: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: '5px',
      position: 'absolute'
    },

    textA: {
      color: colors.invariant.textGrey,
      ...typography.heading4,
      textWrap: 'nowrap'
    },
    textB: {
      color: colors.invariant.text,
      ...typography.body2,
      textWrap: 'nowrap'
    }
  }
})
