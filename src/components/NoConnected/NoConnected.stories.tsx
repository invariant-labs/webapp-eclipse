import { NoConnected } from './NoConnected'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'NoConnected',
  component: NoConnected
} satisfies Meta<typeof NoConnected>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    onConnect: () => {},
    descCustomText: 'You have no positions.'
  }
}
