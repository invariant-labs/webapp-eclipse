import type { Meta, StoryObj } from '@storybook/react'
import { ThankYouModal } from './ThankYouModal'
import { fn } from '@storybook/test'

const meta = {
  title: 'Modals/ThankYouModal',
  component: ThankYouModal
} satisfies Meta<typeof ThankYouModal>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    hideModal: fn()
  }
}
