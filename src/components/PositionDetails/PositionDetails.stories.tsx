import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MemoryRouter } from 'react-router-dom'
import PositionDetails from './PositionDetails'
import { Network } from '@invariant-labs/a0-sdk'

const meta = {
  title: 'Components/PositionDetails',
  component: PositionDetails,
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
} satisfies Meta<typeof PositionDetails>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    currentPrice: 10000 as any,
    leftRange: {
      index: 2 as any,
      x: 23 as any
    },
    rightRange: {
      index: 2 as any,
      x: 45354 as any
    },
    max: 100,
    min: 0,
    midPrice: {
      index: 2 as any,
      x: 45354 as any
    },
    reloadHandler: fn(),
    ticksLoading: false,
    tickSpacing: 1 as any,
    closePosition: fn(),
    tokenX: {
      name: 'BTC',
      balance: 10000,
      claimValue: 10000,
      decimal: 9 as any,
      icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
      liqValue: 10000,
      usdValue: 123
    },
    tokenY: {
      name: 'ETH',
      balance: 432,
      claimValue: 21,
      decimal: 9 as any,
      icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
      liqValue: 321,
      usdValue: 3246
    },
    hasTicksError: false,
    copyPoolAddressHandler: fn(),
    detailsData: [
      {
        x: 12 as any,
        y: 1234 as any,
        index: 1 as any
      },
      {
        x: 123 as any,
        y: 432 as any,
        index: 2 as any
      }
    ],
    fee: 1 as any,
    onClickClaimFee: fn(),
    poolAddress: '0x1234567890',
    tokenXAddress: '0x1234567890',
    tokenYAddress: '0x1234567890',
    onRefresh: fn(),
    isBalanceLoading: false,
    network: Network.Testnet
  },
  render: args => {
    return (
      <PositionDetails
        {...args}
        currentPrice={1000}
        leftRange={{
          index: 2n,
          x: 23
        }}
        rightRange={{
          index: 2n,
          x: 45354
        }}
        midPrice={{
          index: 32n,
          x: 4535
        }}
        tokenX={{
          name: 'BTC',
          balance: 10000,
          claimValue: 10000,
          decimal: 9n,
          icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
          liqValue: 10000,
          usdValue: 123
        }}
        tokenY={{
          name: 'ETH',
          balance: 432,
          claimValue: 21,
          decimal: 9n,
          icon: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
          liqValue: 321,
          usdValue: 3246
        }}
        detailsData={[
          {
            x: 12,
            y: 1234,
            index: 1n
          },
          {
            x: 123,
            y: 432,
            index: 2n
          }
        ]}
        fee={1n}
        tickSpacing={1n}
      />
    )
  }
}
