import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles<{ isHiding: boolean }>()((_theme, { isHiding }) => {
  return {
    background: {
      opacity: 0.7,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      background: colors.invariant.black
    },
    bannerWrapper: {
      position: 'relative',
      background: colors.invariant.light,
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      ...typography.body1,
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      color: colors.invariant.text,
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      willChange: 'height,padding,margin',
      opacity: isHiding ? 0 : 1,
      margin: isHiding ? '0' : undefined
    },
    labelWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginRight: theme.spacing(3)
    },
    airdropWrapper: {
      display: 'flex',
      alignItems: 'center',
      transform: isHiding ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.3s ease-in-out',
      position: 'relative',
      gap: '12px'
    },
    airdrop: {
      width: '24px',
      height: '24px',
      minWidth: '24px',
      objectFit: 'contain',
      marginRight: '12px'
    },
    text: {
      color: colors.invariant.pink,
      textDecoration: 'underline',
      marginLeft: '6px',
      cursor: 'pointer',
      ...typography.body1
    },
    container: {
      width: '100%',
      maxWidth: 512,
      position: 'fixed',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      left: '50%',
      zIndex: 1000
    },
    modal: {
      marginInline: 16,
      background: colors.invariant.component,
      padding: 24,
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      ...typography.body1,
      color: colors.invariant.text
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }
})

export default useStyles
