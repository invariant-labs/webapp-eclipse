import WrappedSwap from '@containers/WrappedSwap/WrappedSwap'
import useStyles from './styles'
import { Grid } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { swapMode } from '@store/selectors/navigation'

export const SwapPage: React.FC = () => {
  const { classes } = useStyles()
  const { item1, item2 } = useParams()

  const swapModeType = useSelector(swapMode)

  const initialTokenFrom = item1 || ''
  const initialTokenTo = item2 || ''

  return (
    <Grid className={classes.container}>
      <WrappedSwap
        initialTokenFrom={initialTokenFrom}
        initialTokenTo={initialTokenTo}
        swapMode={swapModeType}
      />
    </Grid>
  )
}

export default SwapPage
