import { ISwapStore, swapSliceName } from '../reducers/swap'
import { keySelectors, AnyProps } from './helpers'

const store = (s: AnyProps) => s[swapSliceName] as ISwapStore

export const { swap, accounts, routeCandidates, isLoading } = keySelectors(store, [
  'swap',
  'accounts',
  'routeCandidates',
  'isLoading'
])

export const swapSelectors = { swap, accounts, routeCandidates, isLoading }

export default swapSelectors
