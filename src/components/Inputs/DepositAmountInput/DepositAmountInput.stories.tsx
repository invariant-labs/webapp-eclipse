import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import DepositAmountInput from './DepositAmountInput'

const meta = {
  title: 'Inputs/DepositAmountInput',
  component: DepositAmountInput,
  args: {}
} satisfies Meta<typeof DepositAmountInput>

export default meta
type Story = StoryObj<typeof meta>

export const Null: Story = {
  args: {
    currency: null,
    setValue: fn(),
    value: '0',
    placeholder: '0.0',
    onMaxClick: fn(),
    decimalsLimit: 2,
    tokenPrice: 100,
    balanceValue: '1000',
    priceLoading: false,
    currencyIconSrc: '',
    blocked: false,
    blockerInfo: '',
    onBlur: fn(),
    style: {},
    disabled: false,
    isBalanceLoading: false,
    walletUninitialized: true
  }
}

export const BTC: Story = {
  args: {
    currency: 'BTC',
    setValue: fn(),
    value: '0',
    placeholder: '0.0',
    onMaxClick: fn(),
    decimalsLimit: 2,
    tokenPrice: 100,
    balanceValue: '1000',
    priceLoading: false,
    currencyIconSrc: '',
    blocked: false,
    blockerInfo: '',
    onBlur: fn(),
    style: {},
    disabled: false,
    isBalanceLoading: false,
    walletUninitialized: false
  }
}
