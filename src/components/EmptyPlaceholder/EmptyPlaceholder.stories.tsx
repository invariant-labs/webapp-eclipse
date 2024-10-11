import { EmptyPlaceholder } from './EmptyPlaceholder'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Common/EmptyPlaceholder',
  component: EmptyPlaceholder
} satisfies Meta<typeof EmptyPlaceholder>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    desc: 'Add your first position by pressing the button and start earning!'
  }
}
