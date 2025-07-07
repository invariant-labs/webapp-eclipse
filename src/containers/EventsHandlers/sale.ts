import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { network, rpcAddress, status } from '@store/selectors/solanaConnection'
import { Status } from '@store/reducers/solanaConnection'
import { actions } from '@store/reducers/sale'
import { IWallet } from '@invariant-labs/sdk-eclipse'
import { ROUTES } from '@utils/utils'
import { getEclipseWallet } from '@utils/web3/wallet'
import { useLocation } from 'react-router-dom'
import { getSaleProgram } from '@utils/web3/programs/sale'
import { ISaleStats } from '@store/reducers/sale'

const SaleEvents = () => {
  const dispatch = useDispatch()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const wallet = getEclipseWallet()
  const saleProgram = getSaleProgram(networkType, rpc, wallet as IWallet)
  const networkStatus = useSelector(status)
  const location = useLocation()

  useEffect(() => {
    console.log('sale event handler entry')
    if (
      networkStatus !== Status.Initialized ||
      !saleProgram ||
      !location.pathname.startsWith(ROUTES.SALE)
    ) {
      return
    }
    dispatch(actions.getSaleStats())
    const [sale] = saleProgram.getSaleAddressAndBump()
    // @ts-expect-error
    saleProgram.program.account.sale.subscribe(sale).on('change', saleState => {
      console.log(saleState)
      const saleStats: ISaleStats = {
        whitelistWalletLimit: saleState.whitelistWalletLimit,
        currentAmount: saleState.currentAmount,
        targetAmount: saleState.targetAmount,
        startTimestamp: saleState.startTimestamp,
        duration: saleState.duration,
        mint: saleState.mint
      }
      dispatch(actions.setSaleStats({ saleStats }))
    })
  }, [dispatch, networkStatus, saleProgram, location.pathname])

  useEffect(() => {
    if (!location.pathname.startsWith(ROUTES.SALE)) {
      const [sale] = saleProgram.getSaleAddressAndBump()
      // @ts-expect-error
      saleProgram.program.account.sale.unsubscribe(sale)
    }
  }, [location.pathname])

  return null
}

export default SaleEvents
