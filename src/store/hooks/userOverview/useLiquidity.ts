import { ISinglePositionData } from '@components/OverviewYourPositions/components/Overview/Overview'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { printBN } from '@utils/utils'
import { useMemo } from 'react'

export const useLiquidity = (position: ISinglePositionData | undefined) => {
  const tokenXLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getX(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenX.decimals
        )
      } catch (error) {
        return 0
      }
    }

    return 0
  }, [position])

  const tokenYLiquidity = useMemo(() => {
    if (position) {
      try {
        return +printBN(
          getY(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenY.decimals
        )
      } catch (error) {
        console.log(error)
        return 0
      }
    }

    return 0
  }, [position])

  return { tokenXLiquidity, tokenYLiquidity }
}
