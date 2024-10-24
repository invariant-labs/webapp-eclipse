import Header from '@components/Header/Header'
import { RPC, CHAINS, RECOMMENDED_RPC_ADDRESS, NetworkType } from '@store/consts/static'
import { actions, RpcStatus } from '@store/reducers/solanaConnection'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { network, rpcAddress, rpcStatus } from '@store/selectors/solanaConnection'
import { address, status, thankYouModalShown } from '@store/selectors/solanaWallet'
import { nightlyConnectAdapter, openWalletSelectorModal } from '@utils/web3/selector'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { Chain } from '@store/consts/types'
import { RpcErrorModal } from '@components/RpcErrorModal/RpcErrorModal'
import { ThankYouModal } from '@components/Modals/ThankYouModal/ThankYouModal'

export const HeaderWrapper: React.FC = () => {
  const dispatch = useDispatch()
  const walletStatus = useSelector(status)
  const currentNetwork = useSelector(network)
  const currentRpc = useSelector(rpcAddress)
  const isThankYouModalShown = useSelector(thankYouModalShown)

  const location = useLocation()
  const walletAddress = useSelector(address)
  const navigate = useNavigate()

  const hideThankYouModal = () => {
    dispatch(walletActions.showThankYouModal(false))
  }

  useEffect(() => {
    if (currentNetwork === NetworkType.Devnet) {
      dispatch(actions.setNetwork(NetworkType.Testnet))
      dispatch(actions.setRPCAddress(RPC.TEST))
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

  const defaultTestnetRPC = useMemo(() => {
    const lastRPC = localStorage.getItem(`INVARIANT_RPC_Eclipse_${NetworkType.Testnet}`)

    if (lastRPC === null) {
      localStorage.setItem(`INVARIANT_RPC_Eclipse_${NetworkType.Testnet}`, RPC.TEST)
    }

    return lastRPC === null ? RPC.TEST : lastRPC
  }, [])

  const defaultDevnetRPC = useMemo(() => {
    const lastRPC = localStorage.getItem(`INVARIANT_RPC_Eclipse_${NetworkType.Devnet}`)

    if (lastRPC === null) {
      localStorage.setItem(`INVARIANT_RPC_Eclipse_${NetworkType.Devnet}`, RPC.DEV_EU)
    }

    return lastRPC === null ? RPC.DEV_EU : lastRPC
  }, [])

  const defaultMainnetRPC = useMemo(() => {
    const lastRPC = localStorage.getItem(`INVARIANT_RPC_Eclipse_${NetworkType.Mainnet}`)

    if (lastRPC === null) {
      localStorage.setItem(`INVARIANT_RPC_Eclipse_${NetworkType.Mainnet}`, RPC.MAIN)
    }

    return lastRPC === null ? RPC.MAIN : lastRPC
  }, [])

  const activeChain = CHAINS.find(chain => chain.name === Chain.Eclipse) ?? CHAINS[0]

  const currentRpcStatus = useSelector(rpcStatus)

  const useDefaultRpc = () => {
    localStorage.setItem(
      `INVARIANT_RPC_Eclipse_${currentNetwork}`,
      RECOMMENDED_RPC_ADDRESS[currentNetwork]
    )
    dispatch(actions.setRPCAddress(RECOMMENDED_RPC_ADDRESS[currentNetwork]))
    dispatch(actions.setRpcStatus(RpcStatus.Uninitialized))
    localStorage.setItem('IS_RPC_WARNING_IGNORED', 'false')
    window.location.reload()
  }

  const useCurrentRpc = () => {
    dispatch(actions.setRpcStatus(RpcStatus.IgnoredWithError))
    localStorage.setItem('IS_RPC_WARNING_IGNORED', 'true')
  }

  return (
    <>
      {currentRpcStatus === RpcStatus.Error &&
        currentRpc !== RECOMMENDED_RPC_ADDRESS[currentNetwork] && (
          <RpcErrorModal
            rpcAddress={currentRpc}
            useDefaultRpc={useDefaultRpc}
            useCurrentRpc={useCurrentRpc}
          />
        )}
      {isThankYouModalShown && <ThankYouModal hideModal={hideThankYouModal} />}
      <Header
        address={walletAddress}
        onNetworkSelect={(network, rpcAddress) => {
          if (rpcAddress !== currentRpc) {
            localStorage.setItem(`INVARIANT_RPC_Eclipse_${network}`, rpcAddress)
            dispatch(actions.setRPCAddress(rpcAddress))
            dispatch(actions.setRpcStatus(RpcStatus.Uninitialized))
            localStorage.setItem('IS_RPC_WARNING_IGNORED', 'false')
            window.location.reload()
          }

          if (network !== currentNetwork) {
            if (location.pathname.startsWith('/exchange')) {
              navigate('/exchange')
            }

            if (location.pathname.startsWith('/newPosition')) {
              navigate('/newPosition')
            }

            dispatch(actions.setNetwork(network))
          }
        }}
        onConnectWallet={openWalletSelectorModal}
        landing={location.pathname.substring(1)}
        walletConnected={walletStatus === Status.Initialized}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        onFaucet={() => dispatch(walletActions.airdrop())}
        typeOfNetwork={currentNetwork}
        rpc={currentRpc}
        defaultTestnetRPC={defaultTestnetRPC}
        onCopyAddress={() => {
          navigator.clipboard.writeText(walletAddress.toString())

          dispatch(
            snackbarsActions.add({
              message: 'Wallet address copied.',
              variant: 'success',
              persist: false
            })
          )
        }}
        onChangeWallet={() => {
          dispatch(walletActions.reconnect())
        }}
        activeChain={activeChain}
        onChainSelect={chain => {
          if (chain.name !== activeChain.name) {
            window.location.replace(chain.address)
          }
        }}
        network={currentNetwork}
        defaultDevnetRPC={defaultDevnetRPC}
        rpcStatus={currentRpcStatus}
        defaultMainnetRPC={defaultMainnetRPC}
      />
    </>
  )
}

export default HeaderWrapper
