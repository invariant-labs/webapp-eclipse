import type { Meta, StoryObj } from '@storybook/react'
import SelectNetworkButton from './SelectNetworkButton'
import { NetworkType, RPC } from '@store/consts/static'
import { action } from '@storybook/addon-actions'

const meta = {
  title: 'Buttons/SelectNetworkButton',
  component: SelectNetworkButton
} satisfies Meta<typeof SelectNetworkButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    name: NetworkType.Testnet,
    networks: [{ networkType: NetworkType.Testnet, rpc: RPC.TEST }],
    onSelect: (networkType, rpc) => action('chosen: ' + networkType + ' ' + rpc)()
  }
}
