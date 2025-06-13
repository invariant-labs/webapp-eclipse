import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((_theme: Theme) => ({
  wrapper: {
    marginTop: 24,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column'
  }
}))

export default useStyles
