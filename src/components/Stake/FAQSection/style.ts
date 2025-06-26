import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  typography: {
    zIndex: 5,
    position: 'relative',
    '& b': {
      color: colors.invariant.green
    }
  }
}))

export default useStyles
