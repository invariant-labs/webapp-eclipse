// import { NetworkType } from '@store/consts/static'
// import { getSolanaConnection, networkTypetoProgramNetwork } from '../connection'
// import { Sale, IWallet } from '@invariant-labs/sale-sdk'

// let _sale: Sale

// export const getCurrentSaleProgram = (): Sale => {
//   return _sale
// }

// export const getSaleProgram = (
//   networkType: NetworkType,
//   rpcAddress: string,
//   solWallet: IWallet
// ): Sale => {
//   if (_sale) {
//     return _sale
//   }
//   const net = networkTypetoProgramNetwork(networkType)

//   _sale = Sale.build(net, solWallet, getSolanaConnection(rpcAddress))
//   return _sale
// }
