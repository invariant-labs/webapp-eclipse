import type { Meta, StoryObj } from '@storybook/react'
import Faucet from './Faucet'
import { fn } from '@storybook/test'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { MemoryRouter } from 'react-router-dom'

const meta = {
  title: 'Modals/Faucet',
  component: Faucet,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ],
  args: {
    open: true,
    onFaucet: () => {}
  }
} satisfies Meta<typeof Faucet>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { anchorEl: null, open: true, handleClose: fn() }
}
