import React, { useEffect, useMemo } from 'react'
import Header from '@components/Header/Header'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { NetworkType, EclipseNetworks } from '@consts/static'
import { actions as walletActions, Status } from '@reducers/solanaWallet'
import { address, status, thankYouModalShown } from '@selectors/solanaWallet'
import { actions } from '@reducers/solanaConnection'
import { network, rpcAddress } from '@selectors/solanaConnection'
import { nightlyConnectAdapter, openWalletSelectorModal } from '@web3/selector'
import { ThankYouModal } from '@components/Modals/ThankYouModal/ThankYouModal'

export const HeaderWrapper: React.FC = () => {
  const dispatch = useDispatch()
  const walletAddress = useSelector(address)
  const walletStatus = useSelector(status)
  const currentNetwork = useSelector(network)
  const currentRpc = useSelector(rpcAddress)
  const location = useLocation()

  useEffect(() => {
    if (currentNetwork === NetworkType.DEVNET) {
      dispatch(
        actions.setNetwork({ network: NetworkType.TESTNET, rpcAddress: EclipseNetworks.TEST })
      )
    }

    nightlyConnectAdapter.addListener('connect', () => {
      dispatch(walletActions.connect())
    })

    if (nightlyConnectAdapter.connected) {
      dispatch(walletActions.connect())
    }

    nightlyConnectAdapter.canEagerConnect().then(
      async canEagerConnect => {
        if (canEagerConnect) {
          await nightlyConnectAdapter.connect()
        }
      },
      error => {
        console.log(error)
      }
    )
  }, [])

  const defaultMainnetRPC = useMemo(() => {
    const lastRPC = localStorage.getItem('INVARIANT_MAINNET_RPC')

    return lastRPC === null ? EclipseNetworks.MAIN : lastRPC
  }, [])

  const isThankYouModalShown = useSelector(thankYouModalShown)

  const hideThankYouModal = () => {
    dispatch(walletActions.showThankYouModal(false))
  }

  return (
    <>
      {isThankYouModalShown && <ThankYouModal hideModal={hideThankYouModal} />}
      <Header
        address={walletAddress}
        onNetworkSelect={(network, rpcAddress, rpcName) => {
          if (network !== currentNetwork || rpcAddress !== currentRpc) {
            if (network === NetworkType.MAINNET) {
              localStorage.setItem('INVARIANT_MAINNET_RPC', rpcAddress)
            }

            dispatch(actions.setNetwork({ network, rpcAddress, rpcName }))
          }
        }}
        onConnectWallet={openWalletSelectorModal}
        landing={location.pathname.substr(1)}
        walletConnected={walletStatus === Status.Initialized}
        onFaucet={() => {
          dispatch(walletActions.airdrop())
        }}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        typeOfNetwork={currentNetwork}
        rpc={currentRpc}
        defaultMainnetRPC={defaultMainnetRPC}
      />
    </>
  )
}

export default HeaderWrapper
