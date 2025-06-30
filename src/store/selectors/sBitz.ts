import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, stakedData, stakeTab, stakeInputVal, unstakeInputVal } =
  keySelectors(store, [
    'inProgress',
    'success',
    'stakedData',
    'stakeTab',
    'stakeInputVal',
    'unstakeInputVal'
  ])

export const stakeDataLoading = (state: AnyProps) => selectLoadingStates(state).stakeData
export const stakeOperationLoading = (state: AnyProps) => selectLoadingStates(state).stakeOperation

export const sBitzSelectors = {
  inProgress,
  success,
  stakeDataLoading,
  stakeOperationLoading,
  stakedData,
  stakeTab,
  stakeInputVal,
  unstakeInputVal
}
export default sBitzSelectors
