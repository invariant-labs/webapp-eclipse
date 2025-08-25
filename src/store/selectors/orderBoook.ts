import { IOrderBook, orderBookName } from '@store/reducers/orderBook'
import { AnyProps, keySelectors } from './helpers'
import { createSelector } from '@reduxjs/toolkit'
import { pools } from './pools'
import { SwapToken, swapTokensDict } from './solanaWallet'
import { LimitOrder } from '@invariant-labs/sdk-eclipse/lib/market'
import { PublicKey } from '@solana/web3.js'
import { PoolWithAddress } from '@store/reducers/pools'

const store = (s: AnyProps) => s[orderBookName] as IOrderBook

export const {
  currentOrderBook,
  userLimitOrders,
  isLoadingOrderbook,
  loadingState,
  loadingCloseOrder,
  isLoadingUserOrders
} = keySelectors(store, [
  'currentOrderBook',
  'userLimitOrders',
  'isLoadingOrderbook',
  'loadingCloseOrder',
  'loadingState',
  'isLoadingUserOrders'
])

type UserOrderWithTokens = {
  account: LimitOrder
  publicKey: PublicKey
  poolData: PoolWithAddress
  tokenFrom: SwapToken
  tokenTo: SwapToken
}

export const userOrdersWithTokensData = createSelector(
  userLimitOrders,
  pools,
  swapTokensDict,
  (limitOrders, allPools, allTokens): UserOrderWithTokens[] =>
    limitOrders.flatMap(order => {
      const pool = allPools[order.account.pool.toString()]
      if (!pool) return []

      const tokenFrom = order.account.xToY
        ? allTokens[pool.tokenX.toString()]
        : allTokens[pool.tokenY.toString()]

      const tokenTo = order.account.xToY
        ? allTokens[pool.tokenY.toString()]
        : allTokens[pool.tokenX.toString()]

      if (!tokenFrom || !tokenTo) return []

      return [{ poolData: pool, tokenFrom, tokenTo, ...order }]
    })
)

export type UserOrdersWithTokensData = ReturnType<typeof userOrdersWithTokensData>

export const snackbarsSelectors = {
  currentOrderBook,
  userLimitOrders,
  isLoadingOrderbook,
  loadingCloseOrder,
  loadingState,
  isLoadingUserOrders
}

export default snackbarsSelectors
