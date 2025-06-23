import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, stakedData, apyAndApr, stakeTab } = keySelectors(store, [
  'inProgress',
  'success',
  'stakedData',
  'apyAndApr',
  'stakeTab'
])

export const stakeDataLoading = (state: AnyProps) => selectLoadingStates(state).stakeData
export const stakeOperationLoading = (state: AnyProps) => selectLoadingStates(state).stakeOperation
export const stakeApyAndAprLoading = (state: AnyProps) => selectLoadingStates(state).apyAndApr

export const sBitzSelectors = {
  inProgress,
  success,
  stakeDataLoading,
  stakeOperationLoading,
  stakedData,
  apyAndApr,
  stakeTab
}
export default sBitzSelectors
