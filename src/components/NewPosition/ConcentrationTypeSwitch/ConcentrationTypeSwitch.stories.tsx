import type { Meta, StoryObj } from '@storybook/react'
import ConcentrationTypeSwitch from './ConcentrationTypeSwitch'
import { fn } from '@storybook/test'

const meta = {
  title: 'Components/ConcentrationTypeSwitch',
  component: ConcentrationTypeSwitch
} satisfies Meta<typeof ConcentrationTypeSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    currentValue: 0,
    onSwitch: fn()
  }
}
