import { ICreator, creatorSliceName } from '../reducers/creator'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[creatorSliceName] as ICreator

export const { creatorState } = keySelectors(store, ['creatorState'])

export const snackbarsSelectors = { creatorState }

export default snackbarsSelectors
