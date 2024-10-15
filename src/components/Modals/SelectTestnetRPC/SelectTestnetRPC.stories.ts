import type { Meta, StoryObj } from '@storybook/react'
import SelectTestnetRPC from './SelectTestnetRPC'
import { Network } from '@invariant-labs/sdk-eclipse'
import { RpcStatus } from '@store/reducers/solanaConnection'

const meta = {
  title: 'Modals/SelectRPC',
  component: SelectTestnetRPC,
  args: {
    activeRPC: 'https://testnet-mock.com',
    anchorEl: null,
    handleClose: () => {},
    networks: [
      {
        networkType: Network.TEST,
        rpc: 'https://testnet-mock.com',
        rpcName: 'Testnet'
      }
    ],
    onSelect: () => {},
    open: true,
    rpcStatus: RpcStatus.Uninitialized
  }
} satisfies Meta<typeof SelectTestnetRPC>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
