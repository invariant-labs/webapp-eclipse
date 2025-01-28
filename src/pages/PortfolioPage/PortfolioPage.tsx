import WrappedPositionsList from '@containers/WrappedPositionsList/WrappedPositionsList'
import { Grid } from '@mui/material'
import useStyles from './styles'
import { OverviewYourPositions } from '@components/OverviewYourPositions/OverviewYourPositions'

const PortfolioPage: React.FC = () => {
  const { classes } = useStyles()
  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.innerContainer}>
        <OverviewYourPositions />
        <WrappedPositionsList />
      </Grid>
    </Grid>
  )
}

export default PortfolioPage
