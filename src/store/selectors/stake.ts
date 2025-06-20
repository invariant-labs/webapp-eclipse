import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, error, stakedData } = keySelectors(store, [
  'inProgress',
  'success',
  'error',
  'stakedData'
])

export const stakeStatsLoading = (state: AnyProps) => selectLoadingStates(state).stakeStats
export const stakeOperationLoading = (state: AnyProps) => selectLoadingStates(state).stakeOperation

export const solanaWalletSelectors = {
  inProgress,
  success,
  stakeStatsLoading,
  stakeOperationLoading,
  error,
  stakedData
}
export default solanaWalletSelectors
