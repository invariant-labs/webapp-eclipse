import { keySelectors, AnyProps } from './helpers'
import { IxInvt, xInvtSliceName } from '@store/reducers/xInvt'

const store = (s: AnyProps) => s[xInvtSliceName] as IxInvt

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { invtMarketData, inProgress, success, lockerTab, lockInputVal, unlockInputVal } =
  keySelectors(store, [
    'invtMarketData',
    'inProgress',
    'success',
    'lockerTab',
    'lockInputVal',
    'unlockInputVal'
  ])

export const lockOperationLoading = (state: AnyProps) => selectLoadingStates(state).lockOperation
export const invtStatsLoading = (state: AnyProps) => selectLoadingStates(state).invtMarketData

export const xInvtSelectors = {
  invtMarketData,
  inProgress,
  success,
  lockOperationLoading,
  lockerTab,
  lockInputVal,
  unlockInputVal,
  invtStatsLoading
}
export default xInvtSelectors
