import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import useStyles from './styles'
import icons from '@static/icons'
import { theme } from '@static/theme'
import ChangeWalletButton from '@components/Header/HeaderButton/ChangeWalletButton'
import { useDispatch, useSelector } from 'react-redux'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { useMemo } from 'react'
import { status } from '@store/selectors/solanaWallet'
import { UserOverview } from '@components/OverviewYourPositions/UserOverview'
import WrappedPositionsList from '@containers/WrappedPositionsList/WrappedPositionsList'

const PortfolioPage: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const walletStatus = useSelector(status)

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  return (
    <Grid className={classes.container}>
      <Grid container className={classes.innerContainer}>
        {isConnected ? (
          <>
            <UserOverview />
            <WrappedPositionsList />
          </>
        ) : (
          <Box className={classes.notConnectedPlaceholder}>
            <img src={icons.empty} />
            <Typography component='h1'>Wallet is not connected</Typography>
            <Typography component='h2'>No liquidity positions to show.</Typography>
            <Box className={classes.changeWalletButtonContainer}></Box>
            <ChangeWalletButton
              name={isSm ? 'Connect' : 'Connect wallet'}
              onConnect={() => {
                dispatch(walletActions.connect(false))
              }}
              onDisconnect={() => {
                dispatch(walletActions.disconnect())
              }}
              connected={false}
              className={classes.button}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  )
}

export default PortfolioPage
