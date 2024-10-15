import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import Header from './Header'
import { MemoryRouter } from 'react-router-dom'

import { Provider } from 'react-redux'
import { store } from '@store/index'
import { RpcStatus } from '@store/reducers/solanaConnection'
import { Network } from '@invariant-labs/sdk-eclipse'
import { Chain } from '@store/consts/types'

const meta = {
  title: 'Layout/Header',
  component: Header,
  args: {},
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    defaultTestnetRPC: 'https://rpc.testnet.moonbeam.network',
    landing: '',
    onConnectWallet: fn(),
    onDisconnectWallet: fn(),
    onNetworkSelect: fn(),
    rpc: 'https://rpc.testnet.moonbeam.network',
    typeOfNetwork: Network.TEST,
    walletConnected: true,
    onFaucet: fn(),
    onCopyAddress: fn(),
    onChangeWallet: fn(),
    activeChain: {
      name: Chain.Eclipse,
      address: 'https://exlipse.invariant.app'
    },
    onChainSelect: fn(),
    network: Network.TEST,
    defaultMainnetRPC: 'https://rpc.moonbeam.network',
    rpcStatus: RpcStatus.Uninitialized
  }
}
