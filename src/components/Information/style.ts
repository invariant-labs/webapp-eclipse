import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => {
  return {
    container: {
      height: 48,
      background: 'rgba(239, 208, 99, 0.2)',
      border: `2px solid ${colors.invariant.yellow}`,
      borderRadius: 24,
      color: colors.invariant.yellow,
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'height 300ms'
    },
    closeIcon: {
      cursor: 'pointer'
    }
  }
})

export default useStyles
