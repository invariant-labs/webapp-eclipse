import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PopularPools from '@components/PopularPools/PopularPools'
import { isLoading, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { unknownTokenIcon } from '@static/icons'
import { Grid } from '@mui/material'
import { network } from '@store/selectors/solanaConnection'
import { getPopularPools, Intervals } from '@store/consts/static'
import { PublicKey } from '@solana/web3.js'
import { actions } from '@store/reducers/pools'
import { poolsArraySortedByFees } from '@store/selectors/pools'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { parsePathFeeToFeeString } from '@utils/utils'
import { BN } from '@coral-xyz/anchor'
import { actions as statsActions } from '@store/reducers/stats'

export interface PopularPoolData {
  poolAddress?: PublicKey
  symbolFrom?: string
  symbolTo?: string
  iconFrom?: string
  iconTo?: string
  volume?: number
  TVL?: number
  fee?: number
  addressFrom: string
  addressTo: string
  apy?: number
  apyData?: {
    fees: number
    accumulatedFarmsAvg: number
    accumulatedFarmsSingleTick: number
  }
  isUnknownFrom?: boolean
  isUnknownTo?: boolean
}

interface IPopularPoolsWrapper {
  updateInterval: (interval: Intervals) => void
  lastUsedInterval: Intervals | null
}

export const PopularPoolsWrapper: React.FC<IPopularPoolsWrapper> = ({
  lastUsedInterval,
  updateInterval
}) => {
  const dispatch = useDispatch()

  const currentNetwork = useSelector(network)
  const isLoadingStats = useSelector(isLoading)
  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const poolsData = useSelector(poolsArraySortedByFees)

  const [poolsToRefetch, setPoolsToRefetch] = React.useState<
    {
      tokenX: string
      tokenY: string
      fee: string
      tickSpacing: number
    }[]
  >([])

  const list: PopularPoolData[] = useMemo(() => {
    const data: PopularPoolData[] = []

    let popularPools = getPopularPools(currentNetwork)
    if (popularPools.length === 0) {
      //mock data for skeleton loading
      popularPools = poolsList.slice(0, 4).map(pool => ({
        tokenX: pool.tokenX.toString(),
        tokenY: pool.tokenY.toString(),
        fee: pool.fee.toString(),
        tickSpacing: 10
      }))
    }

    popularPools.map(pool => {
      const poolData = poolsList.find(
        item =>
          ((item.tokenX.toString() === pool.tokenX && item.tokenY.toString() === pool.tokenY) ||
            (item.tokenX.toString() === pool.tokenY && item.tokenY.toString() === pool.tokenX)) &&
          item.fee.toString() === pool.fee
      )
      if (poolData) {
        data.push({
          poolAddress: poolData.poolAddress,
          symbolFrom: poolData?.tokenXDetails?.symbol ?? pool.tokenX,
          symbolTo: poolData?.tokenYDetails?.symbol ?? pool.tokenY,
          iconFrom: poolData?.tokenXDetails?.logoURI ?? unknownTokenIcon,
          iconTo: poolData?.tokenYDetails?.logoURI ?? unknownTokenIcon,
          volume: poolData.volume24,
          TVL: poolData.tvl,
          fee: poolData.fee,
          addressFrom: poolData.tokenX.toString(),
          addressTo: poolData.tokenY.toString(),
          apy: poolData.apy,
          apyData: {
            fees: poolData.apy,
            accumulatedFarmsSingleTick: 0,
            accumulatedFarmsAvg: 0
          },
          isUnknownFrom: poolData.tokenXDetails?.isUnknown ?? false,
          isUnknownTo: poolData.tokenYDetails?.isUnknown ?? false
        })
      } else {
        data.push({
          addressFrom: pool.tokenX,
          addressTo: pool.tokenY
        })
      }
    })

    return data
  }, [poolsList])

  const showAPY = useMemo(() => {
    return list.some(pool => pool.apy !== 0)
  }, [list])

  useEffect(() => {
    let popularPools = getPopularPools(currentNetwork)

    const missingPools = popularPools.filter(pool => {
      const match = list.find(item => {
        const tokenX = item.addressFrom
        const tokenY = item.addressTo
        const fee = item.fee?.toString()

        const isSamePair =
          (tokenX === pool.tokenX && tokenY === pool.tokenY) ||
          (tokenX === pool.tokenY && tokenY === pool.tokenX)

        return isSamePair && fee === pool.fee
      })

      return !match
    })

    setPoolsToRefetch(missingPools)
  }, [list, currentNetwork])

  useEffect(() => {
    poolsToRefetch.map(pool => {
      dispatch(
        actions.getPoolData(
          new Pair(new PublicKey(pool.tokenX), new PublicKey(pool.tokenY), {
            fee: new BN(parsePathFeeToFeeString((+pool.fee * 100).toString())),
            tickSpacing: pool.tickSpacing
          })
        )
      )
    })
  }, [poolsToRefetch])

  useEffect(() => {
    poolsToRefetch.forEach(pool => {
      const refechedPool = poolsData.find(
        item =>
          ((item.tokenX.toString() === pool.tokenX && item.tokenY.toString() === pool.tokenY) ||
            (item.tokenX.toString() === pool.tokenY && item.tokenY.toString() === pool.tokenX)) &&
          item.fee.eq(new BN(parsePathFeeToFeeString((+pool.fee * 100).toString())))
      )

      if (refechedPool) {
        dispatch(
          statsActions.getPoolStatsData({
            pair: new Pair(new PublicKey(pool.tokenX), new PublicKey(pool.tokenY), {
              fee: new BN(parsePathFeeToFeeString((+pool.fee * 100).toString())),
              tickSpacing: pool.tickSpacing
            }),
            pool: refechedPool
          })
        )
      }
    })
  }, [poolsData])

  return (
    <Grid container>
      <PopularPools
        pools={list}
        isLoading={isLoadingStats}
        network={currentNetwork}
        showAPY={showAPY}
        lastUsedInterval={lastUsedInterval}
        updateInterval={updateInterval}
      />
    </Grid>
  )
}

export default PopularPoolsWrapper
