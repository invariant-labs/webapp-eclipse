export {}
// TODO: commented until eclipse staker sdk will be available
// import { NetworkType } from '@consts/static'
// import { Staker } from '@invariant-labs/staker-sdk'
// import { getSolanaConnection, networkTypetoStakerNetwork } from '@web3/connection'
// import { getWallet } from '@web3/wallet'

// let _staker: Staker
// export const getCurrentStakerProgram = (): Staker => {
//   return _staker
// }

// export const getStakerProgram = async (
//   networkType: NetworkType,
//   rpcAddress: string
// ): Promise<Staker> => {
//   if (_staker) {
//     return _staker
//   }
//   const net = networkTypetoStakerNetwork(networkType)

//   _staker = await Staker.build(net, getWallet(), getSolanaConnection(rpcAddress))
//   return _staker
// }

// export const getStakerProgramSync = (networkType: NetworkType, rpcAddress: string): Staker => {
//   if (_staker) {
//     return _staker
//   }
//   const net = networkTypetoStakerNetwork(networkType)

//   Staker.build(net, getWallet(), getSolanaConnection(rpcAddress))
//     .then(staker => {
//       _staker = staker
//     })
//     .catch(err => {
//       console.log(err)
//     })

//   return _staker
// }
