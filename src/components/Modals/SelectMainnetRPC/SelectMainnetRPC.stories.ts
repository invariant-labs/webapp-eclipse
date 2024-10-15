import type { Meta, StoryObj } from '@storybook/react'
import SelectMainnetRPC from './SelectMainnetRPC'

import { Network } from '@invariant-labs/sdk-eclipse'
import { RpcStatus } from '@store/reducers/solanaConnection'

const meta = {
  title: 'Modals/SelectRPC',
  component: SelectMainnetRPC,
  args: {
    activeRPC: 'https://mainnet-mock.com',
    anchorEl: null,
    handleClose: () => {},
    networks: [
      {
        networkType: Network.MAIN,
        rpc: 'https://mainnet-mock.com',
        rpcName: 'Mainnet'
      }
    ],
    onSelect: () => {},
    open: true,
    rpcStatus: RpcStatus.Uninitialized
  }
} satisfies Meta<typeof SelectMainnetRPC>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
