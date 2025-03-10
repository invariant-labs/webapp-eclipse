import { ISwapStore, swapSliceName } from '../reducers/swap'
import { keySelectors, AnyProps } from './helpers'

const store = (s: AnyProps) => s[swapSliceName] as ISwapStore

export const { swap, accounts, isLoading } = keySelectors(store, ['swap', 'accounts', 'isLoading'])

export const swapSelectors = { swap, accounts, isLoading }

export default swapSelectors
