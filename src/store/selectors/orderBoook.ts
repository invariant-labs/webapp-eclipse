import { IOrderBook, orderBookName } from '@store/reducers/orderBook'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[orderBookName] as IOrderBook

export const { currentOrderBook } = keySelectors(store, ['currentOrderBook'])

export const snackbarsSelectors = { currentOrderBook }

export default snackbarsSelectors
