import { ILocker, lockerSliceName } from '@store/reducers/locker'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[lockerSliceName] as ILocker

export const { lockerState } = keySelectors(store, ['lockerState'])

export const snackbarsSelectors = { lockerState }

export default snackbarsSelectors
