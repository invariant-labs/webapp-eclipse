import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'

declare global {
  interface Window {
    solana: any
  }

  interface ImportMeta {
    globEager: (x: string) => { [propertyName: string]: { default: string } }
  }
}
export interface Token {
  symbol: string
  address: PublicKey
  decimals: number
  name: string
  logoURI: string
  coingeckoId?: string
  isUnknown?: boolean
}
export const PRICE_DECIMAL = 24
export const USDC_DEV: Token = {
  symbol: 'USDC',
  address: new PublicKey('G6p4KcFS3SNToF3iPNAtpuN3V1d4GYQWj4XUWhBMT4xh'),
  decimals: 9,
  name: 'USD Coin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}
export const BTC_DEV: Token = {
  symbol: 'BTC',
  address: new PublicKey('8yKX1JD2gXgu3SXvZ7RxeYwD32RGwUHcJKvVDskrHLoG'),
  decimals: 9,
  name: 'Bitcoin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  coingeckoId: 'bitcoin'
}
export const WETH_DEV: Token = {
  symbol: 'WETH',
  address: new PublicKey('So11111111111111111111111111111111111111112'),
  decimals: 9,
  name: 'Wrapped Ethereum',
  logoURI:
    'https://raw.githubusercontent.com/wormhole-foundation/wormhole-token-list/main/assets/ETH_wh.png',
  coingeckoId: 'ethereum-wormhole'
}

enum SolanaNetworks {
  TEST = 'https://staging-rpc.dev.eclipsenetwork.xyz', // TODO: TEST and MAIN temporarily set to the same endpoint as DEV; they are unvailable to change to on frontend anyways
  MAIN = 'https://staging-rpc.dev.eclipsenetwork.xyz',
  DEV = 'https://staging-rpc.dev.eclipsenetwork.xyz',
  LOCAL = 'http://127.0.0.1:8899'
}

enum NetworkType {
  DEVNET = 'Devnet',
  TESTNET = 'Testnet',
  LOCALNET = 'Localnet',
  MAINNET = 'Mainnet'
}

const DEFAULT_PUBLICKEY = new PublicKey(0)
const MAX_U64 = new BN('18446744073709551615')

export const tokens: Record<NetworkType, Token[]> = {
  Devnet: [USDC_DEV, BTC_DEV],
  Mainnet: [],
  Testnet: [],
  Localnet: []
}

export interface BestTier {
  tokenX: PublicKey
  tokenY: PublicKey
  bestTierIndex: number
}

const mainnetBestTiersCreator = () => {
  // const stableTokens: Record<string, PublicKey> = {
  // }

  // const unstableTokens: Record<string, PublicKey> = {
  // }

  const bestTiers: BestTier[] = []

  // for (let i = 0; i < 4; i++) {
  //   const tokenX = Object.values(stableTokens)[i]
  //   for (let j = i + 1; j < 4; j++) {
  //     const tokenY = Object.values(stableTokens)[j]

  //     bestTiers.push({
  //       tokenX,
  //       tokenY,
  //       bestTierIndex: 0
  //     })
  //   }
  // }

  // for (let i = 0; i < 5; i++) {
  //   const [symbolX, tokenX] = Object.entries(unstableTokens)[i]
  //   for (let j = i + 1; j < 5; j++) {
  //     const [symbolY, tokenY] = Object.entries(unstableTokens)[j]

  //     if (symbolX.slice(-3) === 'SOL' && symbolY.slice(-3) === 'SOL') {
  //       bestTiers.push({
  //         tokenX,
  //         tokenY,
  //         bestTierIndex: 0
  //       })
  //     } else {
  //       bestTiers.push({
  //         tokenX,
  //         tokenY,
  //         bestTierIndex: 2
  //       })
  //     }
  //   }
  // }

  // for (let i = 0; i < 4; i++) {
  //   const tokenX = Object.values(stableTokens)[i]
  //   for (let j = 0; j < 5; j++) {
  //     const tokenY = Object.values(unstableTokens)[j]

  //     bestTiers.push({
  //       tokenX,
  //       tokenY,
  //       bestTierIndex: 2
  //     })
  //   }
  // }

  return bestTiers
}

export const bestTiers: Record<NetworkType, BestTier[]> = {
  Devnet: [
    {
      tokenX: USDC_DEV.address,
      tokenY: WETH_DEV.address,
      bestTierIndex: 2
    },
    {
      tokenX: USDC_DEV.address,
      tokenY: BTC_DEV.address,
      bestTierIndex: 2
    }
  ],
  Testnet: [],
  Mainnet: mainnetBestTiersCreator(),
  Localnet: []
}

export const commonTokensForNetworks: Record<NetworkType, PublicKey[]> = {
  Devnet: [
    USDC_DEV.address,
    BTC_DEV.address,
    WETH_DEV.address
  ],
  Mainnet: [
  ],
  Testnet: [],
  Localnet: []
}

export const airdropTokens: Record<NetworkType, PublicKey[]> = {
  Devnet: [
    USDC_DEV.address,
    BTC_DEV.address
  ],
  Mainnet: [],
  Testnet: [],
  Localnet: []
}

export const airdropQuantities: Record<NetworkType, number[]> = {
  Devnet: [
    100 * 10 ** USDC_DEV.decimals,
    0.0025 * 10 ** BTC_DEV.decimals
  ],
  Mainnet: [],
  Testnet: [],
  Localnet: []
}

export const WRAPPED_ETH_ADDRESS = 'So11111111111111111111111111111111111111112'

export const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT = new BN(9200961)

export const WETH_POSITION_INIT_LAMPORTS = new BN(6164600)

export const WETH_POOL_INIT_LAMPORTS = new BN(106000961)

export const ALL_FEE_TIERS_DATA = FEE_TIERS.map((tier, index) => ({
  tier,
  primaryIndex: index
}))

export { SolanaNetworks, DEFAULT_PUBLICKEY, MAX_U64, NetworkType }
