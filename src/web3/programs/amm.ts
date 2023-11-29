import { getMarketAddress, Market } from '@invariant-labs/sdk'
import { getSolanaConnection, networkTypetoProgramNetwork } from '@web3/connection'
import { getSolanaWallet } from '@web3/wallet'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from '@consts/static'
let _market: Market
export const getCurrentMarketProgram = (): Market => {
  return _market
}

export const getMarketProgram = async (
  networkType: NetworkType,
  rpcAddress: string
): Promise<Market> => {
  if (_market) {
    return _market
  }
  const net = networkTypetoProgramNetwork(networkType)

  _market = await Market.build(
    net,
    getSolanaWallet(),
    getSolanaConnection(rpcAddress),
    new PublicKey(getMarketAddress(net))
  )
  return _market
}

export const getMarketProgramSync = (networkType: NetworkType, rpcAddress: string): Market => {
  if (_market) {
    return _market
  }
  const net = networkTypetoProgramNetwork(networkType)

  Market.build(
    net,
    getSolanaWallet(),
    getSolanaConnection(rpcAddress),
    new PublicKey(getMarketAddress(net))
  )
    .then(market => {
      _market = market
    })
    .catch(err => {
      console.log(err)
    })

  return _market
}
