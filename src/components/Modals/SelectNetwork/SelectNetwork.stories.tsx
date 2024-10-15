import type { Meta, StoryObj } from '@storybook/react'
import SelectNetwork from './SelectNetwork'
import { Network } from '@invariant-labs/sdk-eclipse'

const meta = {
  title: 'Modals/SelectNetwork',
  component: SelectNetwork,
  args: {
    activeNetwork: Network.TEST,
    anchorEl: null,
    handleClose: () => {},
    networks: [
      {
        networkType: Network.TEST,
        rpc: 'https://testnet-mock.com',
        rpcName: 'Testnet'
      },
      {
        networkType: Network.MAIN,
        rpc: 'https://mock.com',
        rpcName: 'Mainnet'
      }
    ],
    onSelect: () => {},
    open: true
  }
} satisfies Meta<typeof SelectNetwork>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
