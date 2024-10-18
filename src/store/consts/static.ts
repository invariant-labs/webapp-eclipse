import { FEE_TIERS } from '@invariant-labs/sdk-eclipse/lib/utils'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { ISnackbar } from '@store/reducers/snackbars'
import { BestTier, Chain, PrefixConfig, Token, TokenPriceData } from './types'
import { MAINNET_TOKENS } from '@invariant-labs/sdk-eclipse/lib/network'
import icons from '@static/icons'

export enum NetworkType {
  Local = 'Local',
  Testnet = 'Testnet',
  Devnet = 'Devnet',
  Mainnet = 'Mainnet'
}
const emptyPublicKey = new PublicKey(new Uint8Array(32))

export const WETH_ADDRESS = {
  [NetworkType.Mainnet]: new PublicKey('So11111111111111111111111111111111111111112'),
  [NetworkType.Testnet]: new PublicKey('So11111111111111111111111111111111111111112'),
  [NetworkType.Devnet]: new PublicKey('So11111111111111111111111111111111111111112'),
  [NetworkType.Local]: emptyPublicKey
}

export const BTC_ADDRESS = {
  [NetworkType.Mainnet]: new PublicKey(MAINNET_TOKENS.BTC),
  [NetworkType.Testnet]: new PublicKey('2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo'),
  [NetworkType.Devnet]: new PublicKey('CfwLhXJ2r2NmUE1f7oAeySY6eEZ7f5tC8v95nopUs5ez'),
  [NetworkType.Local]: emptyPublicKey
}

export const USDC_ADDRESS = {
  [NetworkType.Mainnet]: new PublicKey(MAINNET_TOKENS.USDC),
  [NetworkType.Testnet]: new PublicKey('5gFSyxjNsuQsZKn9g5L9Ky3cSUvJ6YXqWVuPzmSi8Trx'),
  [NetworkType.Devnet]: new PublicKey('GEds1ARB3oywy2sSdiNGDyxz9MhpfqPkFYYStdZmHaiN'),
  [NetworkType.Local]: emptyPublicKey
}

export const REFRESHER_INTERVAL = 120

export const PRICE_DECIMAL = 24
export const USDC_DEV: Token = {
  symbol: 'USDC',
  address: new PublicKey('GEds1ARB3oywy2sSdiNGDyxz9MhpfqPkFYYStdZmHaiN'),
  decimals: 9,
  name: 'USD Coin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}
export const BTC_DEV: Token = {
  symbol: 'BTC',
  address: new PublicKey('CfwLhXJ2r2NmUE1f7oAeySY6eEZ7f5tC8v95nopUs5ez'),
  decimals: 9,
  name: 'Bitcoin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  coingeckoId: 'bitcoin'
}
export const WETH_DEV: Token = {
  symbol: 'ETH',
  address: new PublicKey('So11111111111111111111111111111111111111112'),
  decimals: 9,
  name: 'Ethereum',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'ethereum'
}

export const USDC_TEST: Token = {
  symbol: 'USDC',
  address: new PublicKey('5gFSyxjNsuQsZKn9g5L9Ky3cSUvJ6YXqWVuPzmSi8Trx'),
  decimals: 9,
  name: 'USD Coin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}

export const BTC_TEST: Token = {
  symbol: 'BTC',
  address: new PublicKey('2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo'),
  decimals: 9,
  name: 'Bitcoin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  coingeckoId: 'bitcoin'
}

export const WETH_TEST: Token = {
  symbol: 'ETH',
  address: new PublicKey('So11111111111111111111111111111111111111112'),
  decimals: 9,
  name: 'Ether',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'ethereum'
}

export const MOON_TEST: Token = {
  symbol: 'MOON',
  address: new PublicKey('JChWwuoqpXZZn6WjSCssjaozj4u65qNgvGFsV6eJ2g8S'),
  decimals: 5,
  name: 'Moon Inu',
  logoURI: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
  coingeckoId: ''
}

export const S22_TEST: Token = {
  symbol: 'S22',
  address: new PublicKey('Bo6ufYtZ7rRtVX2VryazbYjZSgHExfpXST9Xo3Vd3CyA'),
  decimals: 9,
  name: 'S22',
  logoURI: '/unknownToken.svg',
  coingeckoId: ''
}

export const MOCKED_TOKEN_MAIN: Token = {
  symbol: 'MT',
  address: new PublicKey('82kkga2kBcQNyV4VKJhGvE7Z58fFavVyuh5NapMVo7Qs'),
  decimals: 9,
  name: 'Mocked Token',
  logoURI: icons.unknownToken,
  coingeckoId: ''
}

export const WETH_MAIN: Token = {
  symbol: 'ETH',
  address: WETH_ADDRESS[NetworkType.Mainnet],
  decimals: 9,
  name: 'Ethereum',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'ethereum'
}

export enum RPC {
  TEST = 'https://testnet.dev2.eclipsenetwork.xyz',
  MAIN = 'https://mainnetbeta-rpc.eclipse.xyz',
  DEV = 'https://staging-rpc.dev2.eclipsenetwork.xyz',
  DEV_EU = 'https://staging-rpc-eu.dev2.eclipsenetwork.xyz',
  LOCAL = 'http://127.0.0.1:8899'
}

const DEFAULT_PUBLICKEY = new PublicKey(0)
const MAX_U64 = new BN('18446744073709551615')

export const tokensPrices: Record<NetworkType, Record<string, TokenPriceData>> = {
  Devnet: { USDC_DEV: { price: 1 }, BTC_DEV: { price: 64572.0 }, WETH_DEV: { price: 3430.21 } },
  Mainnet: {},
  Testnet: {
    USDC_TEST: { price: 1 },
    BTC_TEST: { price: 64572.0 },
    WETH_TEST: { price: 3430.21 },
    MOON_TEST: { price: 0.00000005735 },
    S22_TEST: { price: 0.01 }
  },
  Local: {}
}
export const tokens: Record<NetworkType, Token[]> = {
  Devnet: [USDC_DEV, BTC_DEV],
  Mainnet: [],
  Testnet: [USDC_TEST, BTC_TEST],
  Local: []
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

  //     if (symbolX.slice(-3) === 'ETH' && symbolY.slice(-3) === 'ETH') {
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
  [NetworkType.Devnet]: [
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
  [NetworkType.Testnet]: [
    {
      tokenX: USDC_TEST.address,
      tokenY: WETH_TEST.address,
      bestTierIndex: 2
    },
    {
      tokenX: USDC_TEST.address,
      tokenY: BTC_TEST.address,
      bestTierIndex: 2
    }
  ],
  [NetworkType.Mainnet]: mainnetBestTiersCreator(),
  [NetworkType.Local]: []
}

export const commonTokensForNetworks: Record<NetworkType, PublicKey[]> = {
  Devnet: [USDC_DEV.address, BTC_DEV.address, WETH_DEV.address],
  Mainnet: [MOCKED_TOKEN_MAIN.address, WETH_MAIN.address],
  Testnet: [USDC_TEST.address, BTC_TEST.address, WETH_TEST.address],
  Local: []
}

export const airdropTokens: Record<NetworkType, PublicKey[]> = {
  Devnet: [USDC_DEV.address, BTC_DEV.address],
  Mainnet: [MOCKED_TOKEN_MAIN.address],
  Testnet: [USDC_TEST.address, BTC_TEST.address],
  Local: []
}

export const airdropQuantities: Record<NetworkType, number[]> = {
  Devnet: [100 * 10 ** USDC_DEV.decimals, 0.0025 * 10 ** BTC_DEV.decimals],
  Mainnet: [1 * 0.0001 ** MOCKED_TOKEN_MAIN.decimals],
  Testnet: [2 * 10 ** USDC_TEST.decimals, 0.00005 * 10 ** BTC_TEST.decimals],
  Local: []
}

export const WRAPPED_ETH_ADDRESS = 'So11111111111111111111111111111111111111112'

export const WETH_MIN_TRANSACTION_FEE_MAIN = new BN(1)

export const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT = new BN(50000)

export const WETH_POSITION_INIT_LAMPORTS = new BN(100000)
export const WETH_POSITION_INIT_LAMPORTS_TEST = new BN(61646)

export const WETH_POOL_INIT_LAMPORTS = new BN(9900000)
export const WETH_POOL_INIT_LAMPORTS_TEST = new BN(1060009)

export const ALL_FEE_TIERS_DATA = FEE_TIERS.map((tier, index) => ({
  tier,
  primaryIndex: index
}))

export { DEFAULT_PUBLICKEY, MAX_U64 }

export const POSITIONS_PER_PAGE = 5

export const SIGNING_SNACKBAR_CONFIG: Omit<ISnackbar, 'open'> = {
  message: 'Signing transactions',
  variant: 'pending',
  persist: true
}

export const ADDRESSES_TO_REVERS_TOKEN_PAIRS: string[] = [
  'So11111111111111111111111111111111111111112'
] // ETH

export const FormatConfig = {
  B: 1000000000,
  M: 1000000,
  K: 1000,
  BDecimals: 9,
  MDecimals: 6,
  KDecimals: 3,
  DecimalsAfterDot: 2
}

export enum PositionTokenBlock {
  None,
  A,
  B
}

export const subNumbers = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

export const defaultPrefixConfig: PrefixConfig = {
  B: 1000000000,
  M: 1000000,
  K: 10000
}
// const mainnetList = {}

export const getAddressTickerMap = (network: NetworkType): { [k: string]: string } => {
  if (network !== NetworkType.Mainnet) {
    return {
      WETH: WETH_ADDRESS[network].toString(),
      BTC: BTC_ADDRESS[network].toString(),
      USDC: USDC_ADDRESS[network].toString(),
      EBGR: 'EBGR1Nb8k3ihiwFuRvXXuxotSKbX7FQWwuzfJEVE9wx9',
      ETH: WETH_ADDRESS[network].toString(),
      MOON: 'JChWwuoqpXZZn6WjSCssjaozj4u65qNgvGFsV6eJ2g8S',
      ECEGG: 'ECEGG4YDbBevPsq5KfL8Vyk6kptY1jhsoeaiG8RMXZ7C'
    }
  } else {
    // const parsedMainnetList = mainnetList as unknown as Record<string, Token>
    // const result: { [k: string]: PublicKey } = {}

    // Object.keys(parsedMainnetList).forEach((key: string) => {
    //   const token = parsedMainnetList[key]
    //   result[token.symbol] = token.address
    // })

    return {
      MT: MOCKED_TOKEN_MAIN.address.toString(),
      ETH: WETH_ADDRESS[network].toString()
    }
  }
}

export const getReversedAddressTickerMap = (network: NetworkType) => {
  console.log('')
  return Object.fromEntries(
    Object.entries(getAddressTickerMap(network)).map(([key, value]) => [value, key])
  )
}

export const MINIMAL_POOL_INIT_PRICE = 0.00000001

export const DEFAULT_SWAP_SLIPPAGE = '0.50'
export const DEFAULT_NEW_POSITION_SLIPPAGE = '0.50'

export const CHAINS = [
  { name: Chain.Solana, address: 'https://invariant.app/swap' },
  { name: Chain.AlephZero, address: 'https://azero.invariant.app/exchange' },
  { name: Chain.Eclipse, address: 'https://eclipse.invariant.app/exchange' },
  { name: Chain.Vara, address: 'https://vara.invariant.app/exchange' },
  { name: Chain.Alephium, address: 'https://alph.invariant.app/exchange' }
]

export const enum SortTypePoolList {
  NAME_ASC,
  NAME_DESC,
  FEE_ASC,
  FEE_DESC,
  VOLUME_ASC,
  VOLUME_DESC,
  TVL_ASC,
  TVL_DESC
  // APY_ASC,
  // APY_DESC
}

export const enum SortTypeTokenList {
  NAME_ASC,
  NAME_DESC,
  PRICE_ASC,
  PRICE_DESC,
  // CHANGE_ASC,
  // CHANGE_DESC,
  VOLUME_ASC,
  VOLUME_DESC,
  TVL_ASC,
  TVL_DESC
}

export const RECOMMENDED_RPC_ADDRESS = {
  [NetworkType.Testnet]: RPC.TEST,
  [NetworkType.Mainnet]: RPC.MAIN,
  [NetworkType.Devnet]: RPC.DEV_EU,
  [NetworkType.Local]: ''
}

export const DEFAULT_TOKEN_DECIMAL = 6
