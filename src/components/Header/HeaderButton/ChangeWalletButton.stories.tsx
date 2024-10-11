import type { Meta, StoryObj } from '@storybook/react'
import ChangeWalletButton from './ChangeWalletButton'
import { fn } from '@storybook/test'

const meta = {
  title: 'Buttons/ChangeWalletButton',
  component: ChangeWalletButton
} satisfies Meta<typeof ChangeWalletButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    name: 'Change Wallet',
    onConnect: fn(),
    connected: false,
    onDisconnect: fn()
  }
}
