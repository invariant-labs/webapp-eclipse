import { Theme } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
  wrapper: {
    marginTop: 24,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: 500,
    height: 500,
    background: colors.invariant.component,
    borderRadius: 24,
    [theme.breakpoints.down('sm')]: {
      padding: '0 8px'
    }
  }
}))

export default useStyles
