import useStyles from './styles'
import { Grid } from '@mui/material'
import { useParams } from 'react-router-dom'
import SwapContainer from '@containers/WrappedSwap/SwapContainer'

export const SwapPage: React.FC = () => {
  const { classes } = useStyles()
  const { item1, item2 } = useParams()

  const initialTokenFrom = item1 || ''
  const initialTokenTo = item2 || ''

  return (
    <Grid className={classes.container}>
      <SwapContainer initialTokenFrom={initialTokenFrom} initialTokenTo={initialTokenTo} />
    </Grid>
  )
}

export default SwapPage
