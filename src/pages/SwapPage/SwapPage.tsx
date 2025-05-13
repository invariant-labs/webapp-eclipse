// import WrappedSwap from '@containers/WrappedSwap/WrappedSwap'
import useStyles from './styles'
import { Grid, Typography } from '@mui/material'
// import { useParams } from 'react-router-dom'

export const SwapPage: React.FC = () => {
  const { classes } = useStyles()
  // const { item1, item2 } = useParams()

  // const initialTokenFrom = item1 || ''
  // const initialTokenTo = item2 || ''

  return (
    <Grid className={classes.container}>
      {/* <WrappedSwap initialTokenFrom={initialTokenFrom} initialTokenTo={initialTokenTo} /> */}
      <div>
        <Typography color={'white'} maxWidth={'100%'}>
          solana provider -----
        </Typography>
        <Typography color={'white'} maxWidth={'100%'}>
          {(window as any).nightly?.solana
            ? JSON.stringify((window as any).nightly?.solana, null, 2)
            : 'solana not found'}
        </Typography>
        {/* <br />
    <Typography color={'white'} maxWidth={'100%'}>
      {'features  -----' + JSON.stringify((window as any).nightly?.solana?.features, null, 1)}
    </Typography> */}
        <br />
        <Typography color={'white'} maxWidth={'100%'}>
          _activeAccount ----
        </Typography>
        <Typography color={'white'} maxWidth={'100%'}>
          {(window as any).nightly?.solana?._activeAccount
            ? JSON.stringify((window as any).nightly?.solana?._activeAccount, null, 2)
            : 'solana account not found'}
        </Typography>
      </div>
    </Grid>
  )
}

export default SwapPage
