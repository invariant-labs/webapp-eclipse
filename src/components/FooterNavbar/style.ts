import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => {
  return {
    navbar: {
      display: 'flex',
      width: '100%',
      background: colors.invariant.component,
      marginTop: '12px',
      position: 'sticky',
      bottom: 0,
      zIndex: 1200
    },
    navbox: {
      width: '20%',
      display: 'flex',
      flexDirection: 'column',
      padding: '17px 9px',
      gap: '12px',
      alignItems: 'center',
      borderRight: `1px solid ${colors.invariant.light}`,

      '& p': {
        ...typography.tiny1,
        color: colors.invariant.textGrey
      },
      ':last-child': {
        borderRight: 'none'
      }
    },
    navImg: {
      height: 21,
      fill: colors.invariant.textGrey
    }
  }
})

export default useStyles
