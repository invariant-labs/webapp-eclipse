import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import EventsHandlers from '@containers/EventHandlers/index'
import FooterWrapper from '@containers/FooterWrapper'
import HeaderWrapper from '@containers/HeaderWrapper/HeaderWrapper'
import { Grid } from '@mui/material'
import { Status, actions as alephZeroConnectionActions } from '@store/reducers/connection'
import { status as connectionStatus } from '@store/selectors/connection'
import { toBlur } from '@utils/uiUtils'
import useStyles from './style'

const RootPage: React.FC = React.memo(() => {
  const dispatch = useDispatch()
  const signerStatus = useSelector(connectionStatus)

  const navigate = useNavigate()
  const location = useLocation()

  const { classes } = useStyles()

  const initConnection = useCallback(() => {
    dispatch(alephZeroConnectionActions.initAlephZeroConnection())
  }, [dispatch])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/exchange')
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    initConnection()
  }, [initConnection])

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
