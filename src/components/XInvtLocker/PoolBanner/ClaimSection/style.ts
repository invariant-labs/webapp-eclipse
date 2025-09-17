import { typography, colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  valueWrapper: {
    display: 'flex',
    gap: 8,
    '& h3': {
      ...typography.heading1,
      color: colors.invariant.text
    }
  }
}))

export default useStyles
