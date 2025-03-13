import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MemoryRouter } from 'react-router-dom'
import TransactionRoute from './TransactionRoute'

import SolarLogo from '../assets/solar-logo.png'
import InvariantLogo from '../assets/invariant-logo.png'
import LifinityLogo from '../assets/lifinity-logo.png'
import UmbraLogo from '../assets/umbra-logo.png'

const meta = {
  title: 'PageComponent/TransactionRoute',
  component: TransactionRoute,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Loading state of the component'
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether to show the close button'
    }
  }
} satisfies Meta<typeof TransactionRoute>

export default meta
type Story = StoryObj<typeof meta>

//
export const OneHop: Story = {
  args: {
    routeData: {
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
          fee: 0.01
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: true,
    isLoading: false
  }
}
export const TwoHops: Story = {
  args: {
    routeData: {
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
          fee: 0.01,
          toToken: {
            symbol: 'LAIKA',
            logoUrl:
              'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
            amount: 1
          }
        },
        {
          name: 'Umbra',
          logoUrl: UmbraLogo,
          fee: 0.05
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: true,
    isLoading: false
  }
}

export const ThreeHops: Story = {
  args: {
    routeData: {
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
            symbol: 'MOON',
            logoUrl: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png',
            amount: 1
          }
        },
        {
          name: 'Lifinity',
          logoUrl: LifinityLogo,
          fee: 0.01
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: true,
    isLoading: false
  }
}

export const FourHops: Story = {
  args: {
    routeData: {
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
            symbol: 'LAIKA',
            logoUrl:
              'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
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
              'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
            amount: 1
          },
          fee: 0.03
        },
        {
          name: 'FooBar',
          logoUrl: UmbraLogo,
          toToken: {
            symbol: 'LAIKA',
            logoUrl:
              'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f736864772d64726976652e67656e65737973676f2e6e65742f387035714352796b774e767a463433484d6b31356243664c3678413934474b65365a526570696e6d576a44692f6c61696b612e706e67',
            amount: 1
          },
          fee: 0.03
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: true,
    isLoading: false
  }
}

export const Loading: Story = {
  args: {
    routeData: {
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
          fee: 0.01
        },
        {
          name: 'Invariant',
          logoUrl: InvariantLogo,
          fee: 0.01
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: true,
    isLoading: true
  }
}

export const NoCloseButton: Story = {
  args: {
    routeData: {
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
          fee: 0.01
        },
        {
          name: 'Invariant',
          logoUrl: InvariantLogo,
          fee: 0.01
        }
      ]
    },
    handleClose: fn(),
    showCloseButton: false,
    isLoading: false
  }
}
