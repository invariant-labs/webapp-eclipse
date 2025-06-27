import { ISwapStore, swapSliceName } from '../reducers/swap'
import { keySelectors, AnyProps } from './helpers'

const store = (s: AnyProps) => s[swapSliceName] as ISwapStore

export const { swap, accounts, isLoading, amountInput } = keySelectors(store, [
  'swap',
  'accounts',
  'isLoading',
  'amountInput'
])

export const swapSelectors = { swap, accounts, isLoading, amountInput }

export default swapSelectors
