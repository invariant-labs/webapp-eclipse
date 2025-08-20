import { useEffect, useCallback, memo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import EventsHandlers from '@containers/EventsHandlers'
import FooterWrapper from '@containers/FooterWrapper'
import HeaderWrapper from '@containers/HeaderWrapper/HeaderWrapper'
import { Grid } from '@mui/material'
import { Status, actions as solanaConnectionActions } from '@store/reducers/solanaConnection'
import { status as connectionStatus } from '@store/selectors/solanaConnection'
import { toBlur } from '@utils/uiUtils'
import useStyles from './style'
import { status } from '@store/selectors/solanaWallet'
import { Status as WalletStatus } from '@store/reducers/solanaWallet'
import { actions as walletActions } from '@store/reducers/solanaWallet'
import { actions } from '@store/reducers/positions'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'
import { getEclipseWallet } from '@utils/web3/wallet'
import { ROUTES } from '@utils/utils'

const RootPage: React.FC = memo(() => {
  const dispatch = useDispatch()
  const signerStatus = useSelector(connectionStatus)
  const walletStatus = useSelector(status)
  const navigate = useNavigate()
  const { classes } = useStyles()
  const location = useLocation()

  const metaData = new Map([
    [ROUTES.EXCHANGE, 'Invariant | Exchange'],
    [ROUTES.LIQUIDITY, 'Invariant | Liquidity'],
    [ROUTES.PORTFOLIO, 'Invariant | Portfolio'],
    [ROUTES.NEW_POSITION, 'Invariant | New Position'],
    // [ROUTES.SALE, 'Invariant | Presale'],
    [ROUTES.POSITION, 'Invariant | Position Details'],
    [ROUTES.STATISTICS, 'Invariant | Statistics'],
    [ROUTES.CREATOR, 'Invariant | Creator'],
    [ROUTES.STAKE, 'Invariant | Stake']
  ])

  useEffect(() => {
    const title =
      metaData.get([...metaData.keys()].find(key => location.pathname.startsWith(key))!) ||
      document.title
    document.title = title
  }, [location])

  const initConnection = useCallback(() => {
    dispatch(solanaConnectionActions.initSolanaConnection())
  }, [dispatch])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(ROUTES.EXCHANGE)
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    initConnection()
  }, [initConnection])

  const walletAddressRef = useRef('')

  useEffect(() => {
    const intervalId = setInterval(() => {
      const addr = getEclipseWallet()?.publicKey.toString()
      if (
        !walletAddressRef.current ||
        (walletAddressRef.current === DEFAULT_PUBLICKEY.toString() &&
          addr !== DEFAULT_PUBLICKEY.toString())
      ) {
        walletAddressRef.current = addr
        return
      }

      if (
        !document.hasFocus() &&
        walletAddressRef.current !== DEFAULT_PUBLICKEY.toString() &&
        walletAddressRef.current !== addr
      ) {
        walletAddressRef.current = addr
        dispatch(walletActions.changeWalletInExtension())
        dispatch(actions.getPositionsList())
        // dispatch(saleActions.getUserStats())
      }

      if (
        document.hasFocus() &&
        walletAddressRef.current !== DEFAULT_PUBLICKEY.toString() &&
        walletAddressRef.current !== addr
      ) {
        walletAddressRef.current = addr
      }
    }, 500)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (signerStatus === Status.Initialized && walletStatus === WalletStatus.Initialized) {
      dispatch(actions.getPositionsList())
    }
  }, [signerStatus, walletStatus])

  return (
    <>
      {signerStatus === Status.Initialized && <EventsHandlers />}
      <div id={toBlur}>
        <Grid className={classes.root}>
          <HeaderWrapper />
          <Grid className={classes.body}>
            <Outlet />
          </Grid>
          <FooterWrapper />
        </Grid>
      </div>
    </>
  )
})

export default RootPage
