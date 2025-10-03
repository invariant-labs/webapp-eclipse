import { ISwapStore, swapSliceName } from '../reducers/swap'
import { keySelectors, AnyProps } from './helpers'

const store = (s: AnyProps) => s[swapSliceName] as ISwapStore

export const { swap, accounts, isLoading, chartInterval } = keySelectors(store, [
  'swap',
  'accounts',
  'isLoading',
  'chartInterval'
])

export const swapSelectors = { swap, accounts, isLoading, chartInterval }

export default swapSelectors
