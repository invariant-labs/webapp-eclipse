import { keySelectors, AnyProps } from './helpers'
import { ISBitz, sBitzSliceName } from '@store/reducers/sBitz'

const store = (s: AnyProps) => s[sBitzSliceName] as ISBitz

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, backedByBITZ, error, stakedAmount, stakedTokenSupply } =
  keySelectors(store, [
    'inProgress',
    'success',
    'stakedAmount',
    'stakedTokenSupply',
    'backedByBITZ'
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
  backedByBITZ,
  error,
  stakedAmount,
  stakedTokenSupply
}
export default solanaWalletSelectors
