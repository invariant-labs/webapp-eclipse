import { IOrderBook, orderBookName } from '@store/reducers/orderBook'
import { AnyProps, keySelectors } from './helpers'
import { createSelector } from '@reduxjs/toolkit'
import { pools } from './pools'
import { swapTokensDict } from './solanaWallet'

const store = (s: AnyProps) => s[orderBookName] as IOrderBook

export const { currentOrderBook, userLimitOrders } = keySelectors(store, [
  'currentOrderBook',
  'userLimitOrders'
])

export const userOrdersWithTokensData = createSelector(
  userLimitOrders,
  pools,
  swapTokensDict,
  (limitOrders, allPools, allTokens) => {
    return limitOrders.map(order => {
      const pool = allPools[order.account.pool.toString()]

      const tokenFrom = order.account.xToY
        ? allTokens[pool.tokenX.toString()]
        : allTokens[pool.tokenY.toString()]

      const tokenTo = order.account.xToY
        ? allTokens[pool.tokenY.toString()]
        : allTokens[pool.tokenX.toString()]

      return {
        poolData: pool,
        tokenFrom,
        tokenTo,
        ...order
      }
    })
  }
)

export type UserOrdersWithTokensData = ReturnType<typeof userOrdersWithTokensData>

export const snackbarsSelectors = { currentOrderBook, userLimitOrders }

export default snackbarsSelectors
