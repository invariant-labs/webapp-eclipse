import { Network } from '@invariant-labs/a0-sdk'
import { PositionItem } from './PositionItem'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'PositionItem',
  component: PositionItem
} satisfies Meta<typeof PositionItem>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    tokenXName: 'BTC',
    tokenYName: 'AZERO',
    tokenXIcon: '',
    tokenYIcon: '',
    min: 2149.6,
    max: 149.6,
    fee: 0.05,
    valueX: 10000.45,
    valueY: 2137.4,
    id: 0,
    address: '',
    tokenXLiq: 5000,
    tokenYLiq: 300.2,
    currentPrice: 10000,
    network: Network.Testnet,
    isFullRange: false
  }
}
