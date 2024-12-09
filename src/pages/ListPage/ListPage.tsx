import WrappedPositionsList from '@containers/WrappedPositionsList/WrappedPositionsList'
import { Grid } from '@mui/material'
import useStyles from './styles'
import PopularPoolsWrapper from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'

const ListPage: React.FC = () => {
  const { classes } = useStyles()
  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.innerContainer}>
        <PopularPoolsWrapper />
        <WrappedPositionsList />
      </Grid>
    </Grid>
  )
}

export default ListPage
