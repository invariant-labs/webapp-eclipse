import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { commonTokensForNetworks, NetworkType } from '@store/consts/static'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { actions as leaderboardActions } from '@store/reducers/leaderboard'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TokenPriceData, UserOrdersFullData } from '@store/consts/types'
import { VariantType } from 'notistack'
import { BN } from '@coral-xyz/anchor'
import LimitOrder from '@components/Swap/LimitOrder'
import {
  DENOMINATOR,
  LIMIT_ORDER_TESTNET_POOL_WHITELIST,
  Market,
  Pair
} from '@invariant-labs/sdk-eclipse'
import OrderHistory from '@components/Swap/OrderHistory/OrderHistory'
import { OrdersHistory, actions as navigationActions } from '@store/reducers/navigation'
import { actions } from '@store/reducers/orderBook'
import { actions as poolsActions, PoolWithAddress } from '@store/reducers/pools'
import { ordersHistory, swapSearch } from '@store/selectors/navigation'
import { ISearchToken } from '@common/FilterSearch/FilterSearch'
import {
  currentOrderBook,
  isLoadingOrderbook,
  isLoadingUserOrders,
  loadingState,
  userOrdersWithTokensData
} from '@store/selectors/orderBoook'
import {
  DecreaseOrderLiquiditySimulationStatus,
  simulateDecreaseOrderLiquidity
} from '@invariant-labs/sdk-eclipse/src/limit-order'
import { calcPriceByTickIndex, printBN } from '@utils/utils'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

type Props = {
  walletStatus: Status
  tokensList: SwapToken[]
  tokensDict: Record<string, SwapToken>
  networkType: NetworkType
  tokensFromState: {
    tokenFrom: PublicKey | null
    setTokenFrom: React.Dispatch<React.SetStateAction<PublicKey | null>>
    tokenTo: PublicKey | null
    setTokenTo: React.Dispatch<React.SetStateAction<PublicKey | null>>
  }
  isBalanceLoading: boolean
  ethBalance: BN
  market: Market
  triggerFetchPrices: () => void
  initialHideUnknownTokensValue: boolean
  setHideUnknownTokensValue: (val: boolean) => void
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  tokenToPriceData?: TokenPriceData
  tokenFromPriceData?: TokenPriceData
  priceFromLoading: boolean
  priceToLoading: boolean
  addTokenHandler: (address: string) => void
  canNavigate: boolean
  initialTokenFromIndex: number | null
  initialTokenToIndex: number | null
  deleteTimeoutError: () => void
  isTimeoutError: boolean
  tokensState: {
    tokenFromIndex: number | null
    setTokenFromIndex: React.Dispatch<React.SetStateAction<number | null>>
    tokenToIndex: number | null
    setTokenToIndex: React.Dispatch<React.SetStateAction<number | null>>
  }
  rateState: {
    rateReversed: boolean
    setRateReversed: React.Dispatch<React.SetStateAction<boolean>>
  }
  inputState: { inputRef: string; setInputRef: React.Dispatch<React.SetStateAction<string>> }
  lockAnimationState: {
    lockAnimation: boolean
    setLockAnimation: React.Dispatch<React.SetStateAction<boolean>>
  }
  swapState: {
    swap: boolean | null
    setSwap: React.Dispatch<React.SetStateAction<boolean | null>>
  }
  rotatesState: {
    rotates: number
    setRotates: React.Dispatch<React.SetStateAction<number>>
  }
  walletAddress: PublicKey
  allPools: PoolWithAddress[]
}
export const WrappedLimitOrder = ({
  addTokenHandler,
  canNavigate,
  copyTokenAddressHandler,
  ethBalance,
  initialHideUnknownTokensValue,
  initialTokenFromIndex,
  initialTokenToIndex,
  isBalanceLoading,
  market,
  networkType,
  priceFromLoading,
  priceToLoading,
  setHideUnknownTokensValue,
  tokensFromState,
  tokensDict,
  tokensList,
  triggerFetchPrices,
  walletStatus,
  tokenFromPriceData,
  tokenToPriceData,
  deleteTimeoutError,
  isTimeoutError,
  rateState,
  tokensState,
  inputState,
  lockAnimationState,
  rotatesState,
  swapState,
  walletAddress,
  allPools
}: Props) => {
  const dispatch = useDispatch()

  const switcherType = useSelector(ordersHistory)
  const searchParamsToken = useSelector(swapSearch)
  const orderBook = useSelector(currentOrderBook)
  const userOrders = useSelector(userOrdersWithTokensData)
  const loadingOrderbook = useSelector(isLoadingOrderbook)
  const loadingUserOrderes = useSelector(isLoadingUserOrders)
  const { setTokenFrom, setTokenTo, tokenFrom, tokenTo } = tokensFromState
  const { inProgress, success } = useSelector(loadingState)
  const [progress, setProgress] = useState<ProgressState>('none')

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1000)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
      }, 3000)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

  const userOrdersFullData: UserOrdersFullData[] = useMemo(() => {
    if (!orderBook) return []

    return userOrders.map(order => {
      const simulateResult = simulateDecreaseOrderLiquidity(
        orderBook,
        order.account,
        order.account.orderTokenAmount
      )
      let filledPercentage = '0'
      if (
        simulateResult.status === DecreaseOrderLiquiditySimulationStatus.PartiallyCompleted ||
        simulateResult.status === DecreaseOrderLiquiditySimulationStatus.FullyCompleted ||
        simulateResult.status === DecreaseOrderLiquiditySimulationStatus.NotStarted
      ) {
        const amountX = simulateResult.amountOutX
        const amountY = simulateResult.amountOutY

        const simulateAmount = order.account.xToY ? amountX : amountY

        const fillPercentageX = DENOMINATOR.sub(
          simulateAmount.mul(DENOMINATOR).div(order.account.orderTokenAmount)
        )

        filledPercentage = (+printBN(fillPercentageX, DECIMAL - 2)).toFixed(2)
      }

      const poolData = allPools.find(pool => {
        return pool.address.toString() === order.account.pool.toString()
      })

      const price = calcPriceByTickIndex(
        order.account.tickIndex,
        order.account.xToY,
        order?.tokenFrom.decimals || 0,
        order?.tokenTo?.decimals || 0
      )

      const pair = new Pair(order.tokenFrom.address, order.tokenTo.address, {
        fee: poolData?.fee || new BN(1000000),
        tickSpacing: poolData?.tickSpacing || 10000
      })

      const orderValue = printBN(
        order.account.orderTokenAmount,
        order.account.xToY ? order.tokenFrom.decimals : order.tokenTo.decimals
      )

      const tokenPrice =
        (order.account.xToY ? tokenToPriceData?.price : tokenFromPriceData?.price) || 0

      return {
        ...order,
        filledPercentage: filledPercentage,
        amountPrice: price,
        pair,
        usdValue: +orderValue * +tokenPrice
      }
    })
  }, [userOrders, orderBook, allPools.length])

  useEffect(() => {
    dispatch(leaderboardActions.getLeaderboardConfig())
  }, [])

  const onRefresh = () => {
    dispatch(walletActions.getBalance())

    triggerFetchPrices()

    if (!orderBookPair?.pair) return
    const { pair } = orderBookPair

    dispatch(
      actions.getOrderBook({
        pair: pair
      })
    )

    dispatch(poolsActions.getPoolData(pair))
    dispatch(actions.getUserOrders())
  }

  const setSearchTokensValue = (tokens: ISearchToken[]) => {
    dispatch(
      navigationActions.setSearch({
        section: 'swapTokens',
        type: 'filteredTokens',
        filteredTokens: tokens
      })
    )
  }

  const orderBookPair = useMemo(() => {
    if (tokenFrom === null || tokenTo === null) {
      return
    }

    const isAvailable = LIMIT_ORDER_TESTNET_POOL_WHITELIST.find(pool => {
      return (
        (pool.pair.tokenX.toString() === tokenFrom.toString() &&
          pool.pair.tokenY.toString() === tokenTo.toString()) ||
        (pool.pair.tokenX.toString() === tokenTo.toString() &&
          pool.pair.tokenY.toString() === tokenFrom.toString())
      )
    })

    return isAvailable
  }, [LIMIT_ORDER_TESTNET_POOL_WHITELIST, tokenFrom, tokenTo])

  const poolData = useMemo(() => {
    if (!orderBookPair) return

    const { pair } = orderBookPair

    const poolData = allPools.find(pool => {
      return (
        pool.tokenX.equals(pair.tokenX) &&
        pool.tokenY.equals(pair.tokenY) &&
        pool.fee.eq(pair.feeTier.fee)
      )
    })

    return poolData
  }, [allPools.length, orderBookPair])

  useEffect(() => {
    if (!orderBookPair?.pair) return
    const { pair } = orderBookPair

    dispatch(
      actions.getOrderBook({
        pair: pair
      })
    )

    dispatch(poolsActions.getPoolData(pair))
  }, [orderBookPair])

  useEffect(() => {
    dispatch(actions.getUserOrders())
  }, [walletStatus])

  return (
    <>
      <LimitOrder
        canNavigate={canNavigate}
        commonTokens={commonTokensForNetworks[networkType]}
        copyTokenAddressHandler={copyTokenAddressHandler}
        deleteTimeoutError={deleteTimeoutError}
        ethBalance={ethBalance}
        handleAddToken={addTokenHandler}
        initialHideUnknownTokensValue={initialHideUnknownTokensValue}
        onSetPair={(tokenFrom, tokenTo) => {
          setTokenFrom(tokenFrom)
          setTokenTo(tokenTo)

          if (tokenFrom !== null) {
            localStorage.setItem(`INVARIANT_LAST_TOKEN_FROM_${networkType}`, tokenFrom.toString())
          }

          if (tokenTo !== null) {
            localStorage.setItem(`INVARIANT_LAST_TOKEN_TO_${networkType}`, tokenTo.toString())
          }
        }}
        initialTokenFromIndex={initialTokenFromIndex === -1 ? null : initialTokenFromIndex}
        initialTokenToIndex={initialTokenToIndex === -1 ? null : initialTokenToIndex}
        tokens={tokensList}
        onHideUnknownTokensChange={setHideUnknownTokensValue}
        tokenFromPriceData={tokenFromPriceData}
        tokenToPriceData={tokenToPriceData}
        priceFromLoading={priceFromLoading || isBalanceLoading}
        priceToLoading={priceToLoading || isBalanceLoading}
        isBalanceLoading={isBalanceLoading}
        network={networkType}
        isTimeoutError={isTimeoutError}
        market={market}
        tokensDict={tokensDict}
        onConnectWallet={() => {
          dispatch(walletActions.connect(false))
        }}
        onDisconnectWallet={() => {
          dispatch(walletActions.disconnect())
        }}
        onRefresh={onRefresh}
        progress={progress}
        walletStatus={walletStatus}
        rateState={rateState}
        tokensState={tokensState}
        inputState={inputState}
        lockAnimationState={lockAnimationState}
        rotatesState={rotatesState}
        swapState={swapState}
        handleAddOrder={(amount, tickIndex, xToY) => {
          if (!tokenFrom || !tokenTo || !orderBookPair || !poolData) return

          setProgress('progress')

          dispatch(
            actions.addLimitOrder({
              amount,
              owner: walletAddress,
              pair: orderBookPair?.pair,
              tickIndex,
              userTokenX: tokenFrom,
              userTokenY: tokenTo,
              xToY,
              poolTickIndex: poolData?.currentTickIndex
            })
          )
        }}
        orderBookPair={
          orderBookPair ? { pair: orderBookPair.pair, tickmap: orderBookPair.orderBook } : undefined
        }
        orderBook={orderBook}
        poolData={poolData}
        isLoading={loadingOrderbook}
      />
      {orderBookPair && walletStatus === Status.Initialized && (
        <OrderHistory
          handleSwitcher={(e: OrdersHistory) => {
            dispatch(navigationActions.setOrderHistory(e))
          }}
          swicherType={switcherType}
          handleRefresh={onRefresh}
          currentNetwork={networkType}
          selectedFilters={searchParamsToken.filteredTokens}
          setSelectedFilters={setSearchTokensValue}
          tokensDict={tokensDict}
          userOrders={userOrdersFullData}
          handleRemoveOrder={(pair, orderKey, amount) => {
            dispatch(
              actions.removeLimitOrder({
                pair,
                owner: walletAddress,
                orderKey,
                amount
              })
            )
          }}
          walletStatus={walletStatus}
          isLoading={loadingUserOrderes}
        />
      )}
    </>
  )
}

export default WrappedLimitOrder
