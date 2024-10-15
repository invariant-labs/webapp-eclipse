import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useState } from 'react'
import DepositSelector, { IDepositSelector } from './DepositSelector'
import { SwapToken } from '@store/selectors/wallet'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { MemoryRouter } from 'react-router-dom'
import { Network } from '@invariant-labs/a0-sdk'
import { Status } from '@store/reducers/wallet'

const tokens: Record<string, SwapToken> = {
  So11111111111111111111111111111111111111112: {
    balance: 111 as any,
    decimals: 6 as any,
    symbol: 'SOL',
    assetAddress: 'So11111111111111111111111111111111111111112',
    name: 'Wrapped Solana',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': {
    balance: 1000 as any,
    decimals: 6 as any,
    symbol: 'BTC',
    assetAddress: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    name: 'BTC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png'
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    balance: 222 as any,
    decimals: 6 as any,
    symbol: 'USDC',
    assetAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD coin',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  }
}

const meta = {
  title: 'Components/DepositSelector',
  component: DepositSelector,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof DepositSelector>

export default meta
type Story = StoryObj<typeof meta>

const PrimaryComponent: React.FC<IDepositSelector> = args => {
  const [feeTierIndex, setFeeTierIndex] = useState<number>(0)

  return (
    <DepositSelector
      {...args}
      setPositionTokens={(_a, _b, fee) => {
        setFeeTierIndex(fee)
      }}
      feeTierIndex={feeTierIndex}
      poolIndex={0}
    />
  )
}

export const Primary: Story = {
  args: {
    commonTokens: [
      'So11111111111111111111111111111111111111112',
      '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    ],
    concentrationArray: Array.from({ length: 141 }, (_, i) => i + 2),
    concentrationIndex: 0,
    feeTiers: [0.02, 0.04, 0.1, 0.3, 1, 2, 5],
    handleAddToken: fn(),
    initialFee: '0.02',
    initialHideUnknownTokensValue: false,
    initialTokenFrom: 'USDC',
    initialTokenTo: 'BTC',
    minimumSliderIndex: 0,
    onAddLiquidity: fn(),
    onHideUnknownTokensChange: fn(),
    onReverseTokens: fn(),
    poolIndex: 0,
    positionOpeningMethod: 'range',
    progress: 'success',
    setPositionTokens: fn(),
    tokens: tokens,
    feeTierIndex: 0,
    tokenAInputState: {
      value: '1234',
      setValue: fn(),
      blocked: false,
      blockerInfo: '',
      decimalsLimit: 12
    },
    tokenBInputState: {
      value: '11',
      setValue: fn(),
      blocked: false,
      blockerInfo: '',
      decimalsLimit: 12
    },
    bestTierIndex: 2,
    priceA: 1111,
    priceB: 2222,
    isBalanceLoading: false,
    isGetLiquidityError: false,
    ticksLoading: false,
    network: Network.Testnet,
    azeroBalance: 20000000000000 as any,
    walletStatus: Status.Initialized,
    onConnectWallet: () => {},
    onDisconnectWallet: () => {}
  },
  render: args => <PrimaryComponent {...args} />
}
