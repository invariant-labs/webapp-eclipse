import { useEffect, useCallback, memo, useMemo, useState } from 'react'
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
import { actions } from '@store/reducers/positions'
import { TimerBanner } from './LeaderboardPage/components/LeaderboardBanner/TimerBanner'
import { useCountdown } from './LeaderboardPage/components/LeaderboardTimer/useCountdown'
import { NormalBanner } from './LeaderboardPage/components/LeaderboardBanner/NormalBanner'
import { LAUNCH_DATE } from './LeaderboardPage/config'
const RootPage: React.FC = memo(() => {
  const [showHeader, setShowHeader] = useState(true)
  const dispatch = useDispatch()
  const signerStatus = useSelector(connectionStatus)
  const walletStatus = useSelector(status)
  const navigate = useNavigate()
  const location = useLocation()

  const { classes } = useStyles()

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

  useEffect(() => {
    if (signerStatus === Status.Initialized && walletStatus === WalletStatus.Initialized) {
      dispatch(actions.getPositionsList())
    }
  }, [signerStatus, walletStatus])
  const [isExpired, setExpired] = useState(false)
  const targetDate = useMemo(() => {
    const date = new Date(LAUNCH_DATE)
    return date
  }, [])

  const { hours, minutes, seconds } = useCountdown({
    targetDate,
    onExpire: () => {
      setExpired(true)
    }
  })

  return (
    <>
      {signerStatus === Status.Initialized && <EventsHandlers />}
      <div id={toBlur}>
        {showHeader && (
          <>
            {isExpired ? (
              <NormalBanner onClose={() => setShowHeader(false)} />
            ) : (
              <TimerBanner seconds={seconds} minutes={minutes} hours={hours} />
            )}
          </>
        )}
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
