import { getMarketAddress, Market } from '@invariant-labs/sdk-eclipse'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from '@store/consts/static'
import { getSolanaConnection, networkTypetoProgramNetwork } from '../connection'
import { getSolanaWallet } from '../wallet'

let _market: Market
export const getCurrentMarketProgram = (): Market => {
  return _market
}

export const getMarketProgram = async (
  network: NetworkType,
  rpcAddress: string
): Promise<Market> => {
  if (_market) {
    return _market
  }

  const net = networkTypetoProgramNetwork(network)

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

  const market = Market.build(
    net,
    getSolanaWallet(),
    getSolanaConnection(rpcAddress),
    new PublicKey(getMarketAddress(net))
  )

  return market
}
