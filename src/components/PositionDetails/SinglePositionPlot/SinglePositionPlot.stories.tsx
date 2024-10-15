import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { MemoryRouter } from 'react-router-dom'
import SinglePositionPlot from './SinglePositionPlot'
import { Provider } from 'react-redux'
import { store } from '@store/index'

const meta = {
  title: 'Components/SinglePositionPlot',
  component: SinglePositionPlot,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof SinglePositionPlot>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    currentPrice: 10000 as any,
    data: [{ x: 0, y: 0, index: 0 as any }],
    leftRange: {
      index: 2 as any,
      x: 10000 as any
    },
    rightRange: {
      index: 2 as any,
      x: 10000 as any
    },
    max: 100,
    min: 0,
    midPrice: {} as any,
    reloadHandler: fn(),
    ticksLoading: false,
    tickSpacing: 1 as any,
    tokenX: {
      name: 'BTC',
      decimal: 9 as any
    },
    tokenY: {
      name: 'ETH',
      decimal: 12 as any
    },
    xToY: true,
    hasTicksError: false
  },
  render: args => {
    return (
      <SinglePositionPlot
        {...args}
        currentPrice={10000}
        leftRange={{
          index: 2,
          x: 10000
        }}
        rightRange={{
          index: 2,
          x: 10000
        }}
        midPrice={{
          index: 2,
          x: 1020
        }}
        tokenX={{
          name: 'BTC',
          decimal: 9
        }}
        tokenY={{
          name: 'ETH',
          decimal: 12
        }}
        tickSpacing={1}
        data={[{ x: 0, y: 0, index: 0 }]}
      />
    )
  }
}
