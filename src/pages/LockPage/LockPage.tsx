import { Grid } from '@mui/material'
import { useStyles } from './styles'
import LockWrapper from '@containers/LockWrapper/LockWrapper'

export const LockPage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.container}>
      <LockWrapper />
    </Grid>
  )
}

export default LockPage
