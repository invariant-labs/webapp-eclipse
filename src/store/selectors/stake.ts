import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

export const { inProgress, success } = keySelectors(store, ['inProgress', 'success'])

export const solanaWalletSelectors = {
  inProgress,
  success
}
export default solanaWalletSelectors
