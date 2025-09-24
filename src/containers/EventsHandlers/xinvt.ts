import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { network, rpcAddress, status } from '@store/selectors/solanaConnection'
import { Status } from '@store/reducers/solanaConnection'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { printBN, ROUTES } from '@utils/utils'
import { getEclipseWallet } from '@utils/web3/wallet'
import { useLocation } from 'react-router-dom'
import { getXInvtLockerProgram } from '@utils/web3/programs/amm'
import { actions, InvtMarketData } from '@store/reducers/xInvt'
import { INVT_MAIN } from '@store/consts/static'

const XInvtEvents = () => {
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const xinvtProgram = getXInvtLockerProgram(networkType, rpc, wallet as IWallet)
  const networkStatus = useSelector(status)
  const location = useLocation()

  useEffect(() => {
    if (
      networkStatus !== Status.Initialized ||
      !xinvtProgram ||
      !location.pathname.startsWith(ROUTES.XINVT)
    ) {
      return
    }
    dispatch(actions.getCurrentStats())
    const { stateAddress } = xinvtProgram.getStateAddress()
    xinvtProgram.program.account.state.subscribe(stateAddress).on('change', xinvtState => {
      const invtStats: InvtMarketData = {
        burnEndTime: xinvtState.burnEndTime,
        burnStartTime: xinvtState.burnStartTime,
        lockedInvt: +printBN(xinvtState.lockedInvt, INVT_MAIN.decimals),
        mintEndTime: xinvtState.mintEndTime,
        mintStartTime: xinvtState.mintStartTime
      }
      dispatch(actions.setCurrentStats(invtStats))
    })
  }, [dispatch, networkStatus, xinvtProgram, location.pathname])

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTES.XINVT)) {
      const { stateAddress } = xinvtProgram.getStateAddress()
      xinvtProgram.program.account.state.unsubscribe(stateAddress)
    }
  }, [location.pathname])

  return null
}

export default XInvtEvents
