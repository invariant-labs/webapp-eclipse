import { BN } from '@coral-xyz/anchor'
import { estimatePointsForUserPositions } from '@invariant-labs/points-sdk'
import { Position, PoolStructure } from '@invariant-labs/sdk-eclipse/lib/market'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { PublicKey } from '@solana/web3.js'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export const usePromotedPool = (
  poolAddress: PublicKey,
  position: Position,
  poolData: PoolWithAddressAndIndex
) => {
  const { promotedPools } = useSelector(leaderboardSelectors.config)

  const { isPromoted, pointsPerSecond } = useMemo(() => {
    if (!poolAddress) return { isPromoted: false, pointsPerSecond: '00' }
    const promotedPool = promotedPools.find(pool => pool.address === poolAddress.toString())
    if (!promotedPool) return { isPromoted: false, pointsPerSecond: '00' }
    return { isPromoted: true, pointsPerSecond: promotedPool.pointsPerSecond }
  }, [promotedPools, poolAddress])

  const estimated24hPoints = useMemo(() => {
    if (!promotedPools.some(pool => pool.address === poolAddress.toString())) {
      return new BN(0)
    }

    const poolPointsPerSecond = promotedPools.find(
      pool => pool.address === poolAddress.toString()
    )!.pointsPerSecond

    return estimatePointsForUserPositions(
      [position],
      poolData as PoolStructure,
      new BN(poolPointsPerSecond, 'hex').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
    )
  }, [poolAddress, position, poolData, promotedPools])

  return { isPromoted, pointsPerSecond, estimated24hPoints }
}
