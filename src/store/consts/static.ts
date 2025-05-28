import { FEE_TIERS, toDecimal } from '@invariant-labs/sdk-eclipse/lib/utils'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { ISnackbar } from '@store/reducers/snackbars'
import { Chain, PrefixConfig, Reward, Token, TokenPriceData, WalletType } from './types'
import { MAINNET_TOKENS } from '@invariant-labs/sdk-eclipse/lib/network'
import { cat1Icon, cat2Icon, dog1Icon, dog2Icon } from '@static/icons'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'

import rewardsArray from '@store/consts/rewards/rewardsArray.json'

export enum NetworkType {
  Local = 'Local',
  Testnet = 'Testnet',
  Devnet = 'Devnet',
  Mainnet = 'Mainnet'
}

export enum DepositOptions {
  Basic = 'Basic',
  Auto = 'Auto'
}

const emptyPublicKey = new PublicKey(new Uint8Array(32))

export enum SwapType {
  Normal,
  WithHop
}

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

export const REFRESHER_INTERVAL = 30

export const PRICE_DECIMAL = 24
export const USDC_DEV: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'USDC',
  address: new PublicKey('GEds1ARB3oywy2sSdiNGDyxz9MhpfqPkFYYStdZmHaiN'),
  decimals: 9,
  name: 'USD Coin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}
export const BTC_DEV: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'BTC',
  address: new PublicKey('CfwLhXJ2r2NmUE1f7oAeySY6eEZ7f5tC8v95nopUs5ez'),
  decimals: 9,
  name: 'Bitcoin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  coingeckoId: 'bitcoin'
}

export const WETH_DEV: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'ETH',
  address: new PublicKey('So11111111111111111111111111111111111111112'),
  decimals: 9,
  name: 'Ethereum',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'bridged-wrapped-ether-eclipse'
}

export const USDC_TEST: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'USDC',
  address: new PublicKey('5gFSyxjNsuQsZKn9g5L9Ky3cSUvJ6YXqWVuPzmSi8Trx'),
  decimals: 9,
  name: 'USD Coin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}

export const BTC_TEST: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'BTC',
  address: new PublicKey('2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo'),
  decimals: 9,
  name: 'Bitcoin',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
  coingeckoId: 'bitcoin'
}

export const WETH_TEST: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'ETH',
  address: new PublicKey('So11111111111111111111111111111111111111112'),
  decimals: 9,
  name: 'Ether',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'bridged-wrapped-ether-eclipse'
}

export const MOON_TEST: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'MOON',
  address: new PublicKey('JChWwuoqpXZZn6WjSCssjaozj4u65qNgvGFsV6eJ2g8S'),
  decimals: 5,
  name: 'Moon Inu',
  logoURI: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
  coingeckoId: ''
}

export const S22_TEST: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'S22',
  address: new PublicKey('Bo6ufYtZ7rRtVX2VryazbYjZSgHExfpXST9Xo3Vd3CyA'),
  decimals: 9,
  name: 'S22',
  logoURI: '/unknownToken.svg',
  coingeckoId: ''
}

export const MOCKED_TOKEN_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'MCT',
  address: new PublicKey('82kkga2kBcQNyV4VKJhGvE7Z58fFavVyuh5NapMVo7Qs'),
  decimals: 9,
  name: 'Mocked Token',
  logoURI: dog1Icon,
  coingeckoId: ''
}

export const USDC_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'USDC',
  address: new PublicKey('AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE'),
  decimals: 6,
  name: 'USD Coin (Hyperlane)',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  coingeckoId: 'usd-coin'
}

export const BITZ_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'BITZ',
  address: new PublicKey('64mggk2nXg6vHC1qCdsZdEFzd5QGN4id54Vbho4PswCF'),
  decimals: 11,
  name: 'BITZ',
  logoURI:
    'https://www.geckoterminal.com/_next/image?url=https%3A%2F%2Fassets.geckoterminal.com%2Fpwhn8c5e9mxmannjvxi4yllnwk1d&w=64&q=75',
  coingeckoId: ''
}

export const USDT_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'USDT',
  address: new PublicKey('CEBP3CqAbW4zdZA57H2wfaSG1QNdzQ72GiQEbQXyW9Tm'),
  decimals: 6,
  name: 'Tether USD (Hyperlane)',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  coingeckoId: 'tether'
}

export const SOL_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'SOL',
  address: new PublicKey('BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL'),
  decimals: 9,
  name: 'Solana (Hyperlane)',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  coingeckoId: 'solana'
}

export const DOGWIFHAT_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'WIF',
  address: new PublicKey('841P4tebEgNux2jaWSjCoi9LhrVr9eHGjLc758Va3RPH'),
  decimals: 6,
  name: 'DOGWIFHAT (Hyperlane)',
  logoURI: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428',
  coingeckoId: 'dogwifcoin'
}

export const WETH_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'ETH',
  address: WETH_ADDRESS[NetworkType.Mainnet],
  decimals: 9,
  name: 'Ethereum',
  logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
  coingeckoId: 'bridged-wrapped-ether-eclipse'
}

export const LAIKA_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'LAIKA',
  address: new PublicKey('LaihKXA47apnS599tyEyasY2REfEzBNe4heunANhsMx'),
  decimals: 5,
  name: 'Laika',
  logoURI:
    'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
  coingeckoId: 'laika-3'
}

export const MOON_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'MOON',
  address: new PublicKey('HgD4Dc6qYCj3UanMDiuC4qANheeTsAvk6DY91B3F8gnL'),
  decimals: 5,
  name: 'MoonCoin',
  logoURI: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
  coingeckoId: 'mooncoin-2'
}

export const GSVM_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'GSVM',
  address: new PublicKey('137EXM1L3m8hDeq29ducnGhYCwEDCAnxcJ7kqD4TcFFC'),
  decimals: 9,
  name: 'GSVM',
  logoURI: 'https://i.mij.rip/2024/10/24/988580889ba810e7d4986fe5b1718c69.jpeg',
  coingeckoId: ''
}

export const DARKMOON_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'DARKMOON',
  address: new PublicKey('F2kbmDAWrcNms6bf98kxkNaKb3chGXea6Dbz8aepQy58'),
  decimals: 6,
  name: 'Dark Moon',
  logoURI: 'https://i.imgur.com/pJ3u7kS.jpeg',
  coingeckoId: ''
}

export const ECAT_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'ECAT',
  address: new PublicKey('9iswScagJJkKAAsRtp7pJB62f3idZRxHr1Sr9hACThFh'),
  decimals: 9,
  name: 'EclipseCat',
  logoURI: 'https://i.mij.rip/2024/10/24/b2e9d0150c4fe30d8a22f6d711ae3c44.jpeg',
  coingeckoId: ''
}

export const TURBO_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'Turbo',
  address: new PublicKey('trbts2EsWyMdnCjsHUFBKLtgudmBD7Rfbz8zCg1s4EK'),
  decimals: 9,
  name: 'Eclip Turbo',
  logoURI:
    'https://bafybeicnocffdewuiq5d2kxi3pyn7yq3lkbiypcqgdhzpszh64agdwgju4.ipfs.w3s.link/Turbo%20logo.png',
  coingeckoId: ''
}

export const MOO_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'MOO',
  address: new PublicKey('8nF4QmTxsFh5L7bBw9qfdfW67CEAdLWuK9EQjsTgk8d'),
  decimals: 9,
  name: 'cow',
  logoURI: 'https://i.imgur.com/DoS5Dyn.png',
  coingeckoId: ''
}

export const EBULL_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'EBull',
  address: new PublicKey('2vvZp5DXtfpm8MV4KLRKqwdqnKfsKZt4pmk31JHnMw3J'),
  decimals: 9,
  name: 'EclipseIsGood',
  logoURI: 'https://wmimg.com/i/1303/2024/10/6719b01383638.jpeg',
  coingeckoId: ''
}

export const PUNKSTAR_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'PUNKSTAR',
  address: new PublicKey('5HMGZW3oGvHRYcqJ817iXvMv1iXruTYF9nyt9iWfg8Lr'),
  decimals: 5,
  name: 'Cryptopunkstar',
  logoURI: 'https://gateway.irys.xyz/57e1EaYNzg86AoGJ59j5cycKH6H3i9V1Db1sJNcAXZhb',
  coingeckoId: ''
}

export const AI16Z_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'ai16z',
  address: new PublicKey('DZLJXHaNeCgjzhS6m2qLwRzAF8HFeyc6zTBU1AmuG79S'),
  decimals: 9,
  name: 'ai16z',
  logoURI: 'https://gateway.irys.xyz/98qj6Hqi6VnYnVzop9RtAGmSe2TDXApdRMtYC4kkuG76',
  coingeckoId: ''
}

export const VLR_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'vlr',
  address: new PublicKey('89jLd8KJrW653MX7VGQKZKZjkqUNKh3ZZ7L6oN6xGtsK'),
  decimals: 9,
  name: 'valery',
  logoURI: 'https://i.imgur.com/BSV6JOp.png',
  coingeckoId: ''
}

export const TIA_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'TIA',
  address: new PublicKey('9RryNMhAVJpAwAGjCAMKbbTFwgjapqPkzpGMfTQhEjf8'),
  decimals: 6,
  name: 'Celestia',
  logoURI:
    'https://github.com/cosmos/chain-registry/blob/master/celestia/images/celestia.png?raw=true',
  coingeckoId: ''
}

export const STTIA_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'stTIA',
  address: new PublicKey('V5m1Cc9VK61mKL8xVYrjR7bjD2BC5VpADLa6ws3G8KM'),
  decimals: 6,
  name: 'Stride Staked TIA',
  logoURI: 'https://github.com/cosmos/chain-registry/blob/master/stride/images/sttia.png?raw=true',
  coingeckoId: ''
}

export const BRICK_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'Brick',
  address: new PublicKey('3Q5RQRTKCH4RWGFVFht1RtM1fx3SSxNGAk1sTuVank6w'),
  decimals: 9,
  name: 'Brick',
  logoURI: 'https://ipfs.io/ipfs/QmQqSjag5q4nQTDcAnqkGrxp5Y2DzBqWB4L6FMM38cszbm',
  coingeckoId: ''
}

export const PANTY_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'PANTY',
  address: new PublicKey('FZLbeANPzvtKPX7cZyRJ53Ce1wihgr57h5r348NziSRD'),
  decimals: 9,
  name: 'Panty Pussycat',
  logoURI: 'https://uploader.irys.xyz/5kfRvn9JjexfBihhNwsnAfxGdJeppvNf89156vkaCkPF',
  coingeckoId: ''
}

export const PODAVINI_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'PODAVINI',
  address: new PublicKey('Aj6HETPRCwjLJBBpfSEnRy8jCp1ZipEs7FTMKi745tsJ'),
  decimals: 9,
  name: 'PODAVINI',
  logoURI: 'https://uploader.irys.xyz/GH55FteKNSLkBPcQ1UtZS4RXUKS4waYeG2XvHaPzrqiR',
  coingeckoId: ''
}

export const DOGW_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'dogw',
  address: new PublicKey('Ev6go111sv39uMrAQeWsatFWgSYdfENuQGtBmr5QRwbJ'),
  decimals: 9,
  name: 'dog wif meat',
  logoURI: 'https://ipfs.io/ipfs/QmVYxFNgSnVFXrbaxTh7Pz6iQ9AJU8e7BLBMcyWiE476mU',
  coingeckoId: ''
}

export const TETH_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'tETH',
  address: new PublicKey('GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn'),
  decimals: 9,
  name: 'Turbo ETH',
  logoURI:
    'https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/06833c4417faafd198ef8cf904612c721e5d96db/deployments/warp_routes/tETH/logo.svg',
  coingeckoId: 'turbo-eth'
}

export const TURBO_AI_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'TURBO',
  address: new PublicKey('6G61dR9rbcGW4btoLFFFDtebUV8J8LmAobnvvzhdf4Vf'),
  decimals: 6,
  name: 'Turbo AI',
  logoURI: 'https://ipfs.io/ipfs/QmV79VJXity4JEmELrRncRTUofFHdjP2bfPpjSXjyCK3xS',
  coingeckoId: ''
}

export const ORCA_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'ORCA',
  address: new PublicKey('2tGbYEm4nuPFyS6zjDTELzEhvVKizgKewi6xT7AaSKzn'),
  decimals: 6,
  name: 'Orca',
  logoURI:
    'https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/ORCA/logo.svg',
  coingeckoId: 'orca'
}

export const SOLAR_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'SOLAR',
  address: new PublicKey('CwrZKtPiZJrAK3tTjNPP22rD9VzeoxQv8iHd6EeyNoze'),
  decimals: 9,
  name: 'SOLAR STUDIOS',
  logoURI:
    'https://statics.eclipsescan.xyz/cdn/imgs/s60?ref=68747470733a2f2f617661746172732e67697468756275736572636f6e74656e742e636f6d2f752f3138343930303638323f733d393626763d34',
  coingeckoId: ''
}

export enum RPC {
  TEST = 'https://testnet.dev2.eclipsenetwork.xyz',
  MAIN = 'https://mainnetbeta-rpc.eclipse.xyz',
  MAIN_HELIUS = 'https://eclipse.helius-rpc.com',
  MAIN_TRITON = 'https://invarian-eclipse-1c78.mainnet.eclipse.rpcpool.com/',
  MAIN_LGNS = 'https://eclipse.lgns.net',
  DEV = 'https://staging-rpc.dev2.eclipsenetwork.xyz',
  DEV_EU = 'https://staging-rpc-eu.dev2.eclipsenetwork.xyz',
  LOCAL = 'http://127.0.0.1:8899'
}

export const EGOAT_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'EGoat',
  address: new PublicKey('Hxazh1rGXPj2LHgvZBm5Us4rJbB4JZYgdBL6ymYfdt1v'),
  decimals: 8,
  name: 'Eclipse Goat',
  logoURI: 'https://ice.frostsky.com/2024/10/25/07f27173568f10a102f09ee700046aa4.jpeg',
  coingeckoId: ''
}

export const DOGO_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'DOGO',
  address: new PublicKey('3imBwxNwVbPnz6yr87HjvdxjNvyCx7cqiuaDyahSB897'),
  decimals: 9,
  name: 'Dogo',
  logoURI: 'https://gateway.irys.xyz/DD7oq5BBPmULMBPsSwyAUTbExKMHuisKtv4HpyUgRU2k',
  coingeckoId: ''
}

export const EZSOL_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'ezSOL',
  address: new PublicKey('Fu5P5ikrnQ8BKZECJ1XeeDAaTgWJUrcjw8JmFrNA8TJk'),
  decimals: 9,
  name: 'Renzo Restaked SOL',
  logoURI:
    'https://nhjibgkrkpvjc4pzb3bk3v2ocom53mu3ruaslsclskqbteianmea.arweave.net/adKAmVFT6pFx-Q7CrddOE5ndspuNASXIS5KgGZEAawg',
  coingeckoId: ''
}

export const KYSOL_MAIN: Token = {
  tokenProgram: TOKEN_PROGRAM_ID,
  symbol: 'kySOL',
  address: new PublicKey('8jN7xMDqJucigQphWHvqAPQPAmk7VJKKsqLmgCkE7XzP'),
  decimals: 9,
  name: 'Token Kyros Restaked SOL',
  logoURI: 'https://bafybeif3jzrcvwktu5bi7wcuxzr36fygo4vqctatapy7zqxawojxrnexwi.ipfs.dweb.link/',
  coingeckoId: ''
}

export const TUSD_MAIN: Token = {
  tokenProgram: TOKEN_2022_PROGRAM_ID,
  symbol: 'tUSD',
  address: new PublicKey('27Kkn8PWJbKJsRZrxbsYDdedpUQKnJ5vNfserCxNEJ3R'),
  decimals: 6,
  name: 'Turbo USD',
  logoURI:
    'https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/85fc184f345916356f0d1ad73fb89ea2f15b95d7/deployments/warp_routes/tUSD/logo.svg',
  coingeckoId: ''
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

export const autoSwapPools = [
  {
    pair: {
      tokenX: new PublicKey('So11111111111111111111111111111111111111112'),
      tokenY: new PublicKey('2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo')
    },
    swapPool: {
      address: new PublicKey('F89YjPNUfP5Q6xxnk8ZSiV3tHzCYKH7TvgLE1Mc9s7H'),
      feeIndex: 0
    }
  },
  {
    pair: {
      tokenX: new PublicKey('5gFSyxjNsuQsZKn9g5L9Ky3cSUvJ6YXqWVuPzmSi8Trx'),
      tokenY: new PublicKey('2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo')
    },
    swapPool: {
      address: new PublicKey('2DqmbNPisbN7nbuAdVr85rs6pR6jpvMVw8iDia2vAXp7'),
      feeIndex: 0
    }
  },
  {
    pair: {
      tokenX: new PublicKey('AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE'),
      tokenY: new PublicKey('BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL')
    },
    swapPool: {
      address: new PublicKey('E2B7KUFwjxrsy9cC17hmadPsxWHD1NufZXTyrtuz8YxC'),
      feeIndex: 3
    }
  },
  {
    pair: {
      tokenX: new PublicKey('AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE'),
      tokenY: new PublicKey('So11111111111111111111111111111111111111112')
    },
    swapPool: {
      address: new PublicKey('HRgVv1pyBLXdsAddq4ubSqo8xdQWRrYbvmXqEDtectce'),
      feeIndex: 3
    }
  },
  {
    pair: {
      tokenX: new PublicKey('So11111111111111111111111111111111111111112'),
      tokenY: new PublicKey('GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn')
    },
    swapPool: {
      address: new PublicKey('FvVsbwsbGVo6PVfimkkPhpcRfBrRitiV946nMNNuz7f9'),
      feeIndex: 0
    }
  },
  {
    pair: {
      tokenX: new PublicKey('BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL'),
      tokenY: new PublicKey('So11111111111111111111111111111111111111112')
    },
    swapPool: {
      address: new PublicKey('86vPh8ctgeQnnn8qPADy5BkzrqoH5XjMCWvkd4tYhhmM'),
      feeIndex: 3
    }
  },
  {
    pair: {
      tokenX: new PublicKey('AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE'),
      tokenY: new PublicKey('CEBP3CqAbW4zdZA57H2wfaSG1QNdzQ72GiQEbQXyW9Tm')
    },
    swapPool: {
      address: new PublicKey('HHHGD7BZ7H5fPLh3DNEPFezpLoYBJ16WsmbwRJXXEFSg'),
      feeIndex: 0
    }
  },
  {
    pair: {
      tokenX: new PublicKey('64mggk2nXg6vHC1qCdsZdEFzd5QGN4id54Vbho4PswCF'),
      tokenY: new PublicKey('So11111111111111111111111111111111111111112')
    },
    swapPool: {
      address: new PublicKey('HG7iQMk29cgs74ZhSwrnye3C6SLQwKnfsbXqJVRi1x8H'),
      feeIndex: 6
    }
  }
]
export const promotedTiers = [
  {
    tokenX: USDC_MAIN.address,
    tokenY: WETH_MAIN.address,
    index: 3
  },
  {
    tokenX: SOL_MAIN.address,
    tokenY: WETH_MAIN.address,
    index: 3
  },
  {
    tokenX: TETH_MAIN.address,
    tokenY: WETH_MAIN.address,
    index: 0
  },
  {
    tokenX: SOL_MAIN.address,
    tokenY: USDC_MAIN.address,
    index: 3
  },
  {
    tokenX: BITZ_MAIN.address,
    tokenY: WETH_MAIN.address,
    index: 6
  }
]

export const commonTokensForNetworks: Record<NetworkType, PublicKey[]> = {
  Devnet: [USDC_DEV.address, BTC_DEV.address, WETH_DEV.address],
  Mainnet: [
    WETH_MAIN.address,
    TETH_MAIN.address,
    USDC_MAIN.address,
    SOL_MAIN.address,
    USDT_MAIN.address,
    BITZ_MAIN.address,
    LAIKA_MAIN.address,
    TIA_MAIN.address
  ],
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
  Mainnet: [1000 * 10 ** MOCKED_TOKEN_MAIN.decimals],
  Testnet: [2 * 10 ** USDC_TEST.decimals, 0.00005 * 10 ** BTC_TEST.decimals],
  Local: []
}

export const WRAPPED_ETH_ADDRESS = 'So11111111111111111111111111111111111111112'

export const WETH_MIN_FAUCET_FEE_TEST = new BN(45000)
export const WETH_MIN_FAUCET_FEE_MAIN = new BN(25000)

export const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_TEST = new BN(50000)
export const WETH_MIN_DEPOSIT_SWAP_FROM_AMOUNT_MAIN = new BN(25000)

export const WETH_POSITION_INIT_LAMPORTS_MAIN = new BN(700000)
export const WETH_POSITION_INIT_LAMPORTS_TEST = new BN(700000)

export const WETH_POOL_INIT_LAMPORTS_MAIN = new BN(1750000)
export const WETH_POOL_INIT_LAMPORTS_TEST = new BN(1100000)

export const WETH_SWAP_AND_POSITION_INIT_LAMPORTS_MAIN = new BN(100000)
export const WETH_SWAP_AND_POSITION_INIT_LAMPORTS_TEST = new BN(100000)

export const WETH_CREATE_TOKEN_LAMPORTS_MAIN = new BN(2000000)
export const WETH_CREATE_TOKEN_LAMPORTS_TEST = new BN(10100000)

export const WETH_CLOSE_POSITION_LAMPORTS_MAIN = new BN(30000)
export const WETH_CLOSE_POSITION_LAMPORTS_TEST = new BN(30000)

export const MINIMUM_PRICE_IMPACT = toDecimal(1, 4)

export const getCreateTokenLamports = (network: NetworkType): BN => {
  switch (network) {
    case NetworkType.Testnet:
      return WETH_CREATE_TOKEN_LAMPORTS_TEST
    case NetworkType.Mainnet:
      return WETH_CREATE_TOKEN_LAMPORTS_MAIN
    default:
      throw new Error('Invalid network')
  }
}

export const ALL_FEE_TIERS_DATA = FEE_TIERS.map((tier, index) => ({
  tier,
  primaryIndex: index
}))

export { DEFAULT_PUBLICKEY, MAX_U64 }

export const POSITIONS_PER_PAGE = 5

export const SIGNING_SNACKBAR_CONFIG: Omit<ISnackbar, 'open'> = {
  message: 'Signing transactions...',
  variant: 'pending',
  persist: true
}

export const ADDRESSES_TO_REVERT_TOKEN_PAIRS: string[] = [
  USDC_MAIN.address.toString(),
  USDT_MAIN.address.toString(),
  TUSD_MAIN.address.toString(),
  WETH_MAIN.address.toString(),
  TETH_MAIN.address.toString(),
  SOL_MAIN.address.toString(),
  KYSOL_MAIN.address.toString(),
  EZSOL_MAIN.address.toString(),
  TIA_MAIN.address.toString(),
  BITZ_MAIN.address.toString()
]

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
    return {
      ETH: WETH_ADDRESS[network].toString(),
      tETH: TETH_MAIN.address.toString(),
      MCT: MOCKED_TOKEN_MAIN.address.toString(),
      USDC: USDC_MAIN.address.toString(),
      SOL: SOL_MAIN.address.toString(),
      USDT: USDT_MAIN.address.toString(),
      WIF: DOGWIFHAT_MAIN.address.toString(),
      LAIKA: LAIKA_MAIN.address.toString(),
      BITZ: BITZ_MAIN.address.toString(),
      MOON: MOON_MAIN.address.toString(),
      GSVM: GSVM_MAIN.address.toString(),
      DARKMOON: DARKMOON_MAIN.address.toString(),
      ECAT: ECAT_MAIN.address.toString(),
      Turbo: TURBO_MAIN.address.toString(),
      MOO: MOO_MAIN.address.toString(),
      EBull: EBULL_MAIN.address.toString(),
      EGoat: EGOAT_MAIN.address.toString(),
      DOGO: DOGO_MAIN.address.toString(),
      PUNKSTAR: PUNKSTAR_MAIN.address.toString(),
      TURBO_AI: TURBO_AI_MAIN.address.toString(),
      ORCA: ORCA_MAIN.address.toString(),
      SOLAR: SOLAR_MAIN.address.toString(),
      KYSOL: KYSOL_MAIN.address.toString(),
      EZSOL: EZSOL_MAIN.address.toString(),
      TUSD: TUSD_MAIN.address.toString()
    }
  }
}

export const getReversedAddressTickerMap = (network: NetworkType) => {
  return Object.fromEntries(
    Object.entries(getAddressTickerMap(network)).map(([key, value]) => [value, key])
  )
}

export const MINIMAL_POOL_INIT_PRICE = 0.00000001

export const DEFAULT_SWAP_SLIPPAGE = '0.50'
export const DEFAULT_NEW_POSITION_SLIPPAGE = '0.50'
export const DEFAULT_AUTOSWAP_MAX_PRICE_IMPACT = '0.50'
export const DEFAULT_AUTOSWAP_MIN_UTILIZATION = '95.00'
export const DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_CREATE_POSITION = '2.50'
export const DEFAULT_AUTOSWAP_MAX_SLIPPAGE_TOLERANCE_SWAP = '0.50'

export const CHAINS = [
  { name: Chain.Solana, address: 'https://invariant.app/swap', iconGlow: 'solanaGlow' },
  // { name: Chain.AlephZero, address: 'https://azero.invariant.app/exchange' },
  {
    name: Chain.Eclipse,
    address: 'https://eclipse.invariant.app/exchange',
    iconGlow: 'eclipseGlow'
  }
  // { name: Chain.Vara, address: 'https://vara.invariant.app/exchange' },
]

export const enum SortTypePoolList {
  NAME_ASC,
  NAME_DESC,
  FEE_ASC,
  FEE_DESC,
  FEE_24_ASC,
  FEE_24_DESC,
  VOLUME_ASC,
  VOLUME_DESC,
  TVL_ASC,
  TVL_DESC,
  APY_ASC,
  APY_DESC
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
  [NetworkType.Mainnet]: RPC.MAIN_TRITON,
  [NetworkType.Devnet]: RPC.DEV_EU,
  [NetworkType.Local]: ''
}
export const ITEMS_PER_PAGE = 10
export const DEFAULT_TOKEN_DECIMAL = 6

export const PRICE_QUERY_COOLDOWN = 60 * 1000

export const TIMEOUT_ERROR_MESSAGE =
  'Transaction has timed out. Check the details to confirm success'

export const MAX_CROSSES_IN_SINGLE_TX = 10
export const MAX_CROSSES_IN_SINGLE_TX_WITH_LUTS = 34

export const walletNames = {
  [WalletType.NIGHTLY_WALLET]: 'Nightly',
  [WalletType.BACKPACK]: 'Backpack',
  [WalletType.SALMON]: 'Salmon',
  [WalletType.OKX]: 'OKX',
  [WalletType.NIGHTLY]: 'Wallet Selector'
}

export const defaultImages: string[] = [dog1Icon, dog2Icon, cat1Icon, cat2Icon]

export const getPopularPools = (network: NetworkType) => {
  switch (network) {
    case NetworkType.Mainnet:
      return [
        {
          tokenX: 'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE',
          tokenY: 'So11111111111111111111111111111111111111112',
          fee: '0.09'
        },
        {
          tokenX: 'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE',
          tokenY: 'BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL',
          fee: '0.09'
        },
        {
          tokenX: 'BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL',
          tokenY: 'So11111111111111111111111111111111111111112',
          fee: '0.09'
        },
        {
          tokenX: '64mggk2nXg6vHC1qCdsZdEFzd5QGN4id54Vbho4PswCF',
          tokenY: 'So11111111111111111111111111111111111111112',
          fee: '1'
        },
        {
          tokenX: 'GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn',
          tokenY: 'So11111111111111111111111111111111111111112',
          fee: '0.01'
        }
      ]
    default:
      return []
  }
}

export const rewards = [...rewardsArray].sort(
  (a, b) => new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()
) as Reward[]

export const LEADERBOARD_DECIMAL = 8

export const LAUNCH_DATE = '2024-12-10T17:20:00'

export enum PointsPageContent {
  Leaderboard = 'leaderboard',
  FAQ = 'faq',
  Claim = 'claim'
}

export type LeaderBoardType = 'Liquidity' | 'Swap' | 'Total'

export const BANNER_STORAGE_KEY = 'invariant-warning-banner'
export const BANNER_HIDE_DURATION = 1000 * 60 * 60 * 1 // 1 hour
export const SNAP_TIME_DELAY = 60 * 4 // IN MINUTES (4 hours)

export enum OverviewSwitcher {
  Overview = 'Overview',
  Wallet = 'Wallet'
}

export const STATS_CACHE_TIME = 30 * 60 * 1000
export const LEADERBOARD_API_URL = 'https://api.invariant.app/api'
export const PRICE_API_URL = 'https://api.invariant.app/price'

export enum AutoswapCustomError {
  FetchError = 0
}

export enum ErrorCodeExtractionKeys {
  ErrorNumber = 'Error Number:',
  Custom = 'Custom":',
  ApprovalDenied = 'Approval Denied',
  UndefinedOnSplit = "Cannot read properties of undefined (reading 'split')",
  RightBracket = '}',
  Dot = '.'
}

const SLIPPAGE_ERROR_MESSAGE = 'Price changed – increase slippage or retry'

export const ERROR_CODE_TO_MESSAGE: Record<number, string> = {
  0x1778: SLIPPAGE_ERROR_MESSAGE,
  0x1773: SLIPPAGE_ERROR_MESSAGE,
  0x1795: SLIPPAGE_ERROR_MESSAGE,
  0x1796: SLIPPAGE_ERROR_MESSAGE,
  0x1775: SLIPPAGE_ERROR_MESSAGE,
  0x1785: SLIPPAGE_ERROR_MESSAGE
}

export const COMMON_ERROR_MESSAGE: string = 'Failed to send. Please try again'
export const APPROVAL_DENIED_MESSAGE: string = 'Transaction approval rejected'

export const ECLIPSE_MAINNET_GENESIS_HASH = 'EAQLJCV2mh23BsK2P9oYpV5CHVLDNHTxYss3URrNmg3s'
export const SOLANA_MAINNET_GENESIS_HASH = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'

export enum Intervals {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly'
  // Yearly = 'yearly' Don't show year in UI
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const chartPlaceholder = {
  tickmaps: [
    { x: 2.33021324081296e-7, y: 0, index: -221810 },
    { x: 0.9686056247049151, y: 0, index: -69400 },
    { x: 0.9695746662960968, y: 6188.340066945488, index: -69390 },
    { x: 0.9881717681706338, y: 6188.340066945488, index: -69200 },
    { x: 0.9891603846976637, y: 20119.790531945488, index: -69190 },
    { x: 0.9911405860036346, y: 20119.790531945488, index: -69170 },
    { x: 0.9921321727081341, y: 28142.450909473402, index: -69160 },
    { x: 0.9931247514617308, y: 28142.450909473402, index: -69150 },
    { x: 0.9941183232608597, y: 30289.879997489374, index: -69140 },
    { x: 0.9951128890397407, y: 30289.879997489374, index: -69130 },
    { x: 0.9961084498595902, y: 38407.97691696376, index: -69120 },
    { x: 0.9971050066563205, y: 40591.04743422989, index: -69110 },
    { x: 0.9981025604929676, y: 57249.16422040085, index: -69100 },
    { x: 1.0011012140019244, y: 57249.16422040085, index: -69070 },
    { x: 1.002102765825214, y: 55066.09370313472, index: -69060 },
    { x: 1.0031053196378097, y: 46947.99678366034, index: -69050 },
    { x: 1.00410887650822, y: 44800.567695644364, index: -69040 },
    { x: 1.0071255750875803, y: 44800.567695644364, index: -69010 },
    { x: 1.00813315394147, y: 36777.90731811645, index: -69000 },
    { x: 1.0091417408922565, y: 22846.45685311645, index: -68990 },
    { x: 1.011161942873156, y: 22846.45685311645, index: -68970 },
    { x: 1.0121735599903756, y: 6188.340066945488, index: -68960 },
    { x: 1.0254170502871547, y: 6188.340066945488, index: -68830 },
    { x: 1.0264429288718113, y: 0, index: -68820 },
    { x: 1.0274698338137271, y: 0, index: -68810 },
    { x: 4291452183844.2334, y: 0, index: 221810 }
  ],
  midPrice: { x: 1, index: -69090 },
  leftRange: { index: -69160, x: 0.9921321727081341 },
  rightRange: { index: -69000, x: 1.00813315394147 },
  plotMin: 0.988931976461467,
  plotMax: 1.0113333501881372,
  tickSpacing: 10
}
