import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import Select from './Select'

const tokens: any = {
  So11111111111111111111111111111111111111112: {
    balance: 111,
    decimals: 6,
    symbol: 'SOL',
    assetAddress: 'So11111111111111111111111111111111111111112',
    name: 'Wrapped Solana',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
    balance: 1000,
    decimals: 6,
    symbol: 'BTC',
    assetAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    name: 'BTC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png'
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    balance: 222,
    decimals: 6,
    symbol: 'USDC',
    assetAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD coin',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
}

const meta = {
  title: 'Inputs/Select',
  component: Select,
  args: {}
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    name: 'Select token',
    current: null,
    onSelect: fn(),
    commonTokens: [
      'So11111111111111111111111111111111111111112',
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    ],
    handleAddToken: fn(),
    initialHideUnknownTokensValue: false,
    tokens: tokens,
    onHideUnknownTokensChange: fn(),
    centered: false,
    hiddenUnknownTokens: false
  }
}
