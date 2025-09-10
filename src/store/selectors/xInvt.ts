import { keySelectors, AnyProps } from './helpers'
import { IxInvt, xInvtSliceName } from '@store/reducers/xInvt'

const store = (s: AnyProps) => s[xInvtSliceName] as IxInvt

const selectLoadingStates = (state: AnyProps) => store(state).loadingStates

export const { inProgress, success, lockerTab, lockInputVal, unlockInputVal } = keySelectors(
  store,
  ['inProgress', 'success', 'lockerTab', 'lockInputVal', 'unlockInputVal']
)

export const lockOperationLoading = (state: AnyProps) => selectLoadingStates(state).lockOperation

export const xInvtSelectors = {
  inProgress,
  success,
  lockOperationLoading,
  lockerTab,
  lockInputVal,
  unlockInputVal
}
export default xInvtSelectors
