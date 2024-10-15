import type { Meta, StoryObj } from '@storybook/react'
import SelectTokenModal from './SelectTokenModal'
import { fn } from '@storybook/test'

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
  title: 'Modals/SelectTokenModal',
  component: SelectTokenModal
} satisfies Meta<typeof SelectTokenModal>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    anchorEl: null,
    handleClose: () => {},
    onSelect: () => {},
    open: true,
    commonTokens: [],
    handleAddToken: fn(),
    initialHideUnknownTokensValue: false,
    onHideUnknownTokensChange: fn(),
    tokens: tokens,
    hiddenUnknownTokens: false
  }
}
