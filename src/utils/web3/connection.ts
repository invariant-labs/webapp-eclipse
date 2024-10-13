import { Connection } from '@solana/web3.js'
import { Network } from '@invariant-labs/sdk-eclipse'
import { NetworkType, RPC } from '@store/consts/static'
// import { Network as StakerNetwork } from '@invariant-labs/staker-sdk'
// import { Network as BondsNetwork } from '@invariant-labs/bonds-sdk'

let _connection: Connection | null = null
let _network: string

const getSolanaConnection = (url: string): Connection => {
  if (_connection && _network === url) {
    return _connection
  }
  _connection = new Connection(url, 'recent')
  _network = url

  return _connection
}

const getHeliusConnection = (type: NetworkType): Connection => {
  switch (type) {
    default:
      return new Connection(
        'https://devnet.helius-rpc.com/?api-key=ef843b40-9876-4a02-a181-a1e6d3e61b4c',
        'recent'
      )
  }
}

const networkTypetoProgramNetwork = (type: NetworkType): Network => {
  switch (type) {
    case NetworkType.Devnet:
      return Network.DEV
    case NetworkType.Local:
      return Network.LOCAL
    case NetworkType.Testnet:
      return Network.TEST
    case NetworkType.Mainnet:
      return Network.MAIN
    default:
      return Network.DEV
  }
}

// const networkTypetoStakerNetwork = (type: NetworkType): StakerNetwork => {
//   switch (type) {
//     case NetworkType.DEVNET:
//       return StakerNetwork.DEV
//     case NetworkType.LOCALNET:
//       return StakerNetwork.LOCAL
//     // case EclipseNetworks.TEST:
//     //   return StakerNetwork.TEST
//     case NetworkType.MAINNET:
//       return StakerNetwork.MAIN
//     default:
//       return StakerNetwork.DEV
//   }
// }

// const networkTypetoBondsNetwork = (type: NetworkType): BondsNetwork => {
//   switch (type) {
//     case NetworkType.DEVNET:
//       return BondsNetwork.DEV
//     case NetworkType.LOCALNET:
//       return BondsNetwork.LOCAL
//     // case EclipseNetworks.TEST:
//     //   return StakerNetwork.TEST
//     // case NetworkType.MAINNET:
//     //   return BondsNetwork.MAIN
//     default:
//       return BondsNetwork.DEV
//   }
// }

const getCurrentSolanaConnection = (): Connection | null => {
  return _connection
}

export {
  getHeliusConnection,
  getSolanaConnection,
  RPC,
  getCurrentSolanaConnection,
  // networkTypetoStakerNetwork,
  networkTypetoProgramNetwork
  // networkTypetoBondsNetwork
}
