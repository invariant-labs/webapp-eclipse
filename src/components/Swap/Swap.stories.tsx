import { Status } from '@store/reducers/wallet'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import Swap from './Swap'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { MemoryRouter } from 'react-router-dom'
import { Network } from '@invariant-labs/a0-sdk'

const meta = {
  title: 'Components/Swap',
  component: Swap,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof Swap>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    commonTokens: [],
    handleAddToken: fn(),
    initialHideUnknownTokensValue: false,
    onSwap: fn(),
    initialSlippage: '0.5',
    initialTokenFrom: 'So11111111111111111111111111111111111111112',
    initialTokenTo: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    isBalanceLoading: false,
    isFetchingNewPool: false,
    isWaitingForNewPool: false,
    onConnectWallet: fn(),
    onDisconnectWallet: fn(),
    onHideUnknownTokensChange: fn(),
    onRefresh: fn(),
    onSetPair: fn(),
    onSlippageChange: fn(),
    pools: [],
    progress: 'none',
    swapData: {
      slippage: 1 as any,
      estimatedPriceAfterSwap: 123 as any,
      tokenFrom: '0x123132423423',
      tokenTo: '0x123132423423',
      amountIn: 123 as any,
      byAmountIn: false,
      amountOut: 1114 as any,
      poolKey: null
    },
    tickmap: {},
    tokens: {},
    walletStatus: Status.Initialized,
    simulateResult: {
      poolKey: null,
      amountOut: 1000000000000 as any,
      priceImpact: 1.23,
      targetSqrtPrice: 1000000000000000000000000 as any,
      fee: 200000000 as any,
      errors: []
    },
    simulateSwap: fn(),
    copyTokenAddressHandler: fn(),
    network: Network.Testnet,
    azeroBalance: 20000000000000 as any
  },
  render: args => {
    return (
      <Swap
        {...args}
        swapData={{
          slippage: 1 as any,
          estimatedPriceAfterSwap: 123 as any,
          tokenFrom: '0x123132423423',
          tokenTo: '0x123132423423',
          amountIn: 123 as any,
          byAmountIn: false,
          amountOut: 1114 as any,
          poolKey: null
        }}
        simulateResult={{
          poolKey: null,
          amountOut: 1000000000000 as any,
          priceImpact: 1.23,
          targetSqrtPrice: 100000000000000 as any,
          fee: 200000000 as any,
          errors: []
        }}
      />
    )
  }
}
