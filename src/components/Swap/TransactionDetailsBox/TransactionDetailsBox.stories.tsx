import type { Meta, StoryObj } from '@storybook/react'
import TransactionDetailsBox from './TransactionDetailsBox'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import { MemoryRouter } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { BN } from '@coral-xyz/anchor'

const meta = {
  title: 'Components/TransactionDetailsBox',
  component: TransactionDetailsBox,
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <SnackbarProvider maxSnack={99}>
            <Story />
          </SnackbarProvider>
        </MemoryRouter>
      </Provider>
    )
  ]
} satisfies Meta<typeof TransactionDetailsBox>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    exchangeRate: { val: 123, symbol: 'ABC', decimal: 12 },
    slippage: 0.5,
    priceImpact: new BN(5000000000),
    open: true,
    isLoadingRate: false,
    simulationPath: {
      tokenFrom: null,
      tokenBetween: null,
      tokenTo: null,
      firstPair: null,
      secondPair: null,
      firstAmount: null,
      secondAmount: null,
      firstPriceImpact: null,
      secondPriceImpact: null
    }
  },
  render: args => {
    return <TransactionDetailsBox {...args} />
  }
}
