import { theme } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  mainContainer: {
    flex: 1,
    width: '100%'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginTop: 24,

    [theme.breakpoints.up(1040)]: {
      flexDirection: 'row'
    }
  },
  leftSide: {
    flexGrow: 1,

    [theme.breakpoints.up(1040)]: {
      width: 464
    }
  },
  rightSide: {
    flexGrow: 1
  }
}))
