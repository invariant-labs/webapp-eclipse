import { useEffect, useCallback, memo, useState, useLayoutEffect, useRef } from 'react'
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
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { actions } from '@store/reducers/positions'
import { DEFAULT_PUBLICKEY, NetworkType } from '@store/consts/static'
import { network } from '@store/selectors/solanaConnection'
import { NormalBanner } from '@components/Leaderboard/LeaderboardBanner/NormalBanner'
import { getEclipseWallet } from '@utils/web3/wallet'
import { leaderboardSelectors } from '@store/selectors/leaderboard'

const BANNER_STORAGE_KEY = 'invariant-banner-state-3'
const BANNER_HIDE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

const RootPage: React.FC = memo(() => {
  const [showHeader, setShowHeader] = useState(() => {
    const storedData = localStorage.getItem(BANNER_STORAGE_KEY)
    if (storedData) {
      try {
        const { hiddenAt } = JSON.parse(storedData)
        const currentTime = new Date().getTime()
        return currentTime - hiddenAt >= BANNER_HIDE_DURATION
      } catch (error) {
        return true
      }
    }
    return true
  })

  const [isHiding, setIsHiding] = useState(false)
  const dispatch = useDispatch()
  const signerStatus = useSelector(connectionStatus)
  const walletStatus = useSelector(status)
  const navigate = useNavigate()
  const currentNetwork = useSelector(network)
  const { classes } = useStyles()
  const location = useLocation()

  const metaData = new Map([
    ['/exchange', 'Invariant | Exchange'],
    ['/liquidity', 'Invariant | Liquidity'],
    ['/portfolio', 'Invariant | Portfolio'],
    ['/newPosition', 'Invariant | New Position'],
    ['/position', 'Invariant | Position Details'],
    ['/points', 'Invariant | Points'],
    ['/statistics', 'Invariant | Statistics'],
    ['/creator', 'Invariant | Creator']
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
      navigate('/exchange')
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    initConnection()
  }, [initConnection])

  const walletAddressRef = useRef('')
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const addr = getEclipseWallet().publicKey.toString()
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
        dispatch(leaderboardActions.getLeaderboardData({ page: 1, itemsPerPage }))
        dispatch(actions.getPositionsList())
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

  const handleBannerClose = () => {
    setIsHiding(true)
    setTimeout(() => {
      setShowHeader(false)
      localStorage.setItem(
        BANNER_STORAGE_KEY,
        JSON.stringify({
          hiddenAt: new Date().getTime()
        })
      )
      setIsHiding(false)
    }, 400)
  }

  useLayoutEffect(() => {
    const checkBannerState = () => {
      const storedData = localStorage.getItem(BANNER_STORAGE_KEY)
      if (storedData) {
        try {
          const { hiddenAt } = JSON.parse(storedData)
          const currentTime = new Date().getTime()
          if (currentTime - hiddenAt < BANNER_HIDE_DURATION) {
            setShowHeader(false)
          } else {
            localStorage.removeItem(BANNER_STORAGE_KEY)
            setShowHeader(true)
          }
        } catch (error) {
          console.error('Error parsing banner state:', error)
          localStorage.removeItem(BANNER_STORAGE_KEY)
        }
      }
    }

    checkBannerState()
  }, [])

  return (
    <>
      {signerStatus === Status.Initialized && <EventsHandlers />}
      <div id={toBlur}>
        <Grid className={classes.root}>
          {showHeader && currentNetwork === NetworkType.Mainnet && (
            <>
              <NormalBanner onClose={handleBannerClose} isHiding={isHiding} />
            </>
          )}
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
