import { createSelector } from 'reselect'
import { IPositionsStore, positionsSliceName, PositionWithAddress } from '../reducers/positions'
import { AnyProps, keySelectors } from './helpers'
import { poolsArraySortedByFees } from './pools'
import { SwapToken, swapTokensDict } from './solanaWallet'
import { PoolWithAddress } from '@store/reducers/pools'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { printBN } from '@utils/utils'

const store = (s: AnyProps) => s[positionsSliceName] as IPositionsStore

export const {
  lastPage,
  positionsList,
  plotTicks,
  currentPoolIndex,
  prices,
  currentPositionId,
  initPosition,
  shouldNotUpdateRange
} = keySelectors(store, [
  'lastPage',
  'positionsList',
  'currentPoolIndex',
  'plotTicks',
  'prices',
  'currentPositionId',
  'initPosition',
  'shouldNotUpdateRange'
])

export const lastPageSelector = lastPage

export const isLoadingPositionsList = createSelector(positionsList, s => s.loading)

export interface PoolWithAddressAndIndex extends PoolWithAddress {
  poolIndex: number
}

export interface PositionWithPoolData extends PositionWithAddress {
  poolData: PoolWithAddressAndIndex
  tokenX: SwapToken
  tokenY: SwapToken
  positionIndex: number
}

export type PositionData = ReturnType<typeof positionsWithPoolsData>[number]

export const positionsWithPoolsData = createSelector(
  poolsArraySortedByFees,
  positionsList,
  swapTokensDict,
  (allPools, { list }, tokens) => {
    const poolsByKey: Record<string, PoolWithAddressAndIndex> = {}
    allPools.forEach((pool, index) => {
      poolsByKey[pool.address.toString()] = {
        ...pool,
        poolIndex: index
      }
    })
    return list.map((position, index) => ({
      ...position,
      poolData: poolsByKey[position.pool.toString()],
      tokenX: tokens[poolsByKey[position.pool.toString()].tokenX.toString()],
      tokenY: tokens[poolsByKey[position.pool.toString()].tokenY.toString()],
      positionIndex: index,
      isLocked: false
    }))
  }
)

export const lockedPositionsWithPoolsData = createSelector(
  poolsArraySortedByFees,
  positionsList,
  swapTokensDict,
  (allPools, { lockedList }, tokens) => {
    const poolsByKey: Record<string, PoolWithAddressAndIndex> = {}
    allPools.forEach((pool, index) => {
      poolsByKey[pool.address.toString()] = {
        ...pool,
        poolIndex: index
      }
    })
    return lockedList.map((position, index) => ({
      ...position,
      poolData: poolsByKey[position.pool.toString()],
      tokenX: tokens[poolsByKey[position.pool.toString()].tokenX.toString()],
      tokenY: tokens[poolsByKey[position.pool.toString()].tokenY.toString()],
      positionIndex: index,
      isLocked: true
    }))
  }
)

export const singlePositionData = (id: string) =>
  createSelector(
    positionsWithPoolsData,
    lockedPositionsWithPoolsData,
    (positions, lockedPositions) => {
      const finalData = [...positions, ...lockedPositions]
      return finalData.find(
        position => id === position.id.toString() + '_' + position.pool.toString()
      )
    }
  )

export const currentPositionData = createSelector(
  currentPositionId,
  positionsWithPoolsData,
  lockedPositionsWithPoolsData,
  (id, positions, lockedPositions) => {
    if (!id) return undefined
    const allPositions = [...positions, ...lockedPositions]
    return allPositions.find(
      position => id === position.id.toString() + '_' + position.pool.toString()
    )
  }
)

export const totalUnlaimedFees = createSelector(
  positionsWithPoolsData,
  lockedPositionsWithPoolsData,
  prices,
  (positions, lockedPositions, pricesData) => {
    const allPositions = [...positions, ...lockedPositions]

    const isLoading = allPositions.some(position => position.ticksLoading)

    const total = allPositions.reduce((acc: number, position) => {
      const [bnX, bnY] = calculateClaimAmount({
        position,
        tickLower: position.lowerTick,
        tickUpper: position.upperTick,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      const xValue =
        +printBN(bnX, position.tokenX.decimals) *
        (pricesData.data[position.tokenX.assetAddress.toString()] ?? 0)
      const yValue =
        +printBN(bnY, position.tokenY.decimals) *
        (pricesData.data[position.tokenY.assetAddress.toString()] ?? 0)

      return acc + xValue + yValue
    }, 0)

    return { total, isLoading }
  }
)

export const positionsSelectors = {
  positionsList,
  plotTicks,
  currentPositionId,
  initPosition,
  shouldNotUpdateRange
}

export default positionsSelectors
