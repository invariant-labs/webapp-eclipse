import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, error, stakedData } = keySelectors(store, [
  'inProgress',
  'success',
  'stakedData'
])

export const stakeStatsLoading = (state: AnyProps) => selectLoadingStates(state).stakeStats
export const backedByBITZLoading = (state: AnyProps) => selectLoadingStates(state).backedByBITZ
export const stakeOperationLoading = (state: AnyProps) => selectLoadingStates(state).stakeOperation

export const solanaWalletSelectors = {
  inProgress,
  success,
  stakeStatsLoading,
  backedByBITZLoading,
  stakeOperationLoading,
  error,
  stakedData
}
export default solanaWalletSelectors
