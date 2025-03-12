import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MemoryRouter } from 'react-router-dom'
import SinglePositionInfo from './SinglePositionInfo'
import { NetworkType } from '@store/consts/static'
import { BN } from '@coral-xyz/anchor'

const meta = {
  title: 'Components/SinglePositionInfo',
  component: SinglePositionInfo,
  decorators: [
    Story => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
} satisfies Meta<typeof SinglePositionInfo>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    closePosition: fn(),
    fee: 1,
    onClickClaimFee: fn(),
    swapHandler: fn(),
    onModalOpen: fn(),
    tokenX: {
      name: 'BTC',
      icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
      decimal: 9,
      liqValue: 10000.23532,
      claimValue: 21.37,
      balance: 9.11
    },
    tokenY: {
      name: 'ETH',
      icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
      decimal: 12,
      liqValue: 10000.23532,
      claimValue: 21.37,
      balance: 9.11
    },
    xToY: true,
    showFeesLoader: false,
    isBalanceLoading: false,
    isActive: true,
    network: NetworkType.Testnet,
    isLocked: false,
    ethBalance: new BN(10000000),
    isPreview: false
  },
  render: args => {
    return (
      <SinglePositionInfo
        {...args}
        fee={1}
        tokenX={{
          name: 'BTC',
          icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
          decimal: 9,
          liqValue: 10000.23532,
          claimValue: 21.37,
          balance: 9.11
        }}
        tokenY={{
          name: 'ETH',
          icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
          decimal: 12,
          liqValue: 10000.23532,
          claimValue: 21.37,
          balance: 9.11
        }}
        xToY={true}
        closePosition={fn()}
        onClickClaimFee={fn()}
      />
    )
  }
}
