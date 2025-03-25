import SolarLogo from '@static/png/InvariantAggregator/solar.png'
import LifinityLogo from '@static/png/InvariantAggregator/lifinity.png'
import UmbraLogo from '@static/png/InvariantAggregator/umbra.png'
import InvariantLogo from '@static/png/InvariantAggregator/Invariant.png'
import OrcaLogo from '@static/png/InvariantAggregator/Orca.png'

export const routes = [
  {
    sourceToken: {
      symbol: 'ETH',
      logoUrl:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
      amount: 1
    },
    destinationToken: {
      symbol: 'MOON',
      logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
      amount: 0.0001
    },
    exchanges: [
      {
        name: 'Solar',
        logoUrl: SolarLogo,
        fee: 0.01
      }
    ]
  },
  {
    sourceToken: {
      symbol: 'ETH',
      logoUrl:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
      amount: 1
    },
    destinationToken: {
      symbol: 'MOON',
      logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
      amount: 0.0000001
    },
    exchanges: [
      {
        name: 'Solar',
        logoUrl: SolarLogo,
        fee: 0.01,
        toToken: {
          symbol: 'SOL',
          logoUrl:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          amount: 45345343534
        }
      },
      {
        name: 'Invariant',
        logoUrl: InvariantLogo,
        fee: 0.01
      }
    ]
  },
  {
    sourceToken: {
      symbol: 'ETH',
      logoUrl:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
      amount: 1
    },
    destinationToken: {
      symbol: 'MOON',
      logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
      amount: 43534354
    },
    exchanges: [
      {
        name: 'Solar',
        logoUrl: SolarLogo,
        toToken: {
          symbol: 'MOON',
          logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
          amount: 1
        },
        fee: 0.01
      },
      {
        name: 'Invariant',
        logoUrl: InvariantLogo,
        fee: 0.01,
        toToken: {
          symbol: 'SOL',
          logoUrl:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          amount: 23423
        }
      },
      {
        name: 'Lifinity',
        logoUrl: LifinityLogo,
        fee: 0.01
      }
    ]
  },
  {
    sourceToken: {
      symbol: 'ETH',
      logoUrl:
        'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
      amount: 1
    },
    destinationToken: {
      symbol: 'MOON',
      logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
      amount: 1
    },
    exchanges: [
      {
        name: 'Solar',
        logoUrl: SolarLogo,
        toToken: {
          symbol: 'LAIKA',
          logoUrl:
            'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
          amount: 1
        },
        fee: 0.01
      },
      {
        name: 'Invariant',
        logoUrl: InvariantLogo,
        toToken: {
          symbol: 'ETH',
          logoUrl:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
          amount: 1
        },
        fee: 0.03
      },
      {
        name: 'Umbra',
        logoUrl: UmbraLogo,
        toToken: {
          symbol: 'SOL',
          logoUrl:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          amount: 1
        },
        fee: 0.03
      },
      {
        name: 'Orca',
        logoUrl: OrcaLogo,
        toToken: {
          symbol: 'LAIKA',
          logoUrl:
            'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
          amount: 1
        },
        fee: 0.03
      }
    ]
  }
]
