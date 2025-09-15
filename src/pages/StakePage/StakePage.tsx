import { Grid } from '@mui/material'
import { useStyles } from './styles'
import WrappedStake from '@containers/StakeWrapper/WrappedStake'

export const StakePage: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.container}>
      <WrappedStake />
    </Grid>
  )
}

export default StakePage
