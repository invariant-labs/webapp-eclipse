import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  root: { width: '220px' },
  container: {
    position: 'relative',
    height: 317
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%'
  }
}))
