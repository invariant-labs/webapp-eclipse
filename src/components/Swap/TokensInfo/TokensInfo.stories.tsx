import type { Meta, StoryObj } from '@storybook/react'
import TokensInfo from './TokensInfo'
import { fn } from '@storybook/test'
import { BTC_TEST, NetworkType, USDC_TEST } from '@store/consts/static'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { MemoryRouter } from 'react-router-dom'

const meta = {
  title: 'Components/TokensInfo',
  component: TokensInfo,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof TokensInfo>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    copyTokenAddressHandler: fn(),
    tokenFrom: {
      balance: 234234000343400000n as any,
      symbol: BTC_TEST.symbol,
      assetAddress: BTC_TEST.address,
      name: BTC_TEST.name,
      logoURI: BTC_TEST.logoURI,
      coingeckoId: BTC_TEST.coingeckoId,
      decimals: BTC_TEST.decimals,
      isUnknown: false
    },
    tokenTo: {
      balance: 23435345450000400n as any,
      symbol: USDC_TEST.symbol,
      assetAddress: USDC_TEST.address,
      name: USDC_TEST.name,
      logoURI: USDC_TEST.logoURI,
      coingeckoId: USDC_TEST.coingeckoId,
      decimals: USDC_TEST.decimals,
      isUnknown: false
    },
    tokenFromPrice: 53433 as any,
    tokenToPrice: 3243 as any,
    network: NetworkType.Testnet
  },
  render: args => {
    return <TokensInfo {...args} />
  }
}
