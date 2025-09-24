import { keySelectors, AnyProps } from './helpers'
import { IxInvt, xInvtSliceName } from '@store/reducers/xInvt'

const store = (s: AnyProps) => s[xInvtSliceName] as IxInvt

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const {
  invtMarketData,
  inProgress,
  success,
  lockerTab,
  lockInputVal,
  unlockInputVal,
  config,
  userPoints
} = keySelectors(store, [
  'invtMarketData',
  'inProgress',
  'success',
  'lockerTab',
  'lockInputVal',
  'unlockInputVal',
  'config',
  'userPoints'
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
  invtStatsLoading,
  config,
  userPoints
}
export default xInvtSelectors
