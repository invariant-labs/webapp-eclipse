import type { Meta, StoryObj } from '@storybook/react'
import PoolInit from './PoolInit'
import { fn } from '@storybook/test'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { store } from '@store/index'

const meta = {
  title: 'Components/PoolInit',
  component: PoolInit,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof PoolInit>

export default meta
type Story = StoryObj<typeof meta>

const PrimaryComponent: React.FC<typeof Primary.args> = args => {
  const [midPrice, setMidPrice] = useState<bigint>(0n)

  return (
    <PoolInit
      {...args}
      midPriceIndex={midPrice}
      onChangeMidPrice={setMidPrice}
      tickSpacing={1n}
      xDecimal={9n}
      yDecimal={12n}
    />
  )
}

export const Primary: Story = {
  args: {
    currentPairReversed: false,
    isXtoY: true,
    midPriceIndex: 0 as any,
    onChangeMidPrice: fn(),
    onChangeRange: fn(),
    tickSpacing: 1 as any,
    tokenASymbol: 'BTC',
    tokenBSymbol: 'ETH',
    xDecimal: 9 as any,
    yDecimal: 12 as any,
    concentrationArray: [0.1, 0.2, 0.3, 0.4, 0.5],
    concentrationIndex: 2,
    minimumSliderIndex: 0,
    setConcentrationIndex: fn(),
    positionOpeningMethod: 'range'
  },
  render: args => <PrimaryComponent {...args} />
}
