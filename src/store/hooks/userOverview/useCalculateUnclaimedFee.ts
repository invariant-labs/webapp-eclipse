import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { rpcAddress, network } from '@store/selectors/solanaConnection'
import { printBN } from '@utils/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { getEclipseWallet } from '@utils/web3/wallet'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
export const useCalculateUnclaimedFee = (positionList: any, prices: Record<string, number>) => {
  const rpc = useSelector(rpcAddress)
  const networkType = useSelector(network)
  const [totalUnclaimedFee, setTotalUnclaimedFee] = useState(0)

  useEffect(() => {
    const calculateUnclaimedFee = async () => {
      try {
        const wallet = getEclipseWallet()
        const marketProgram = await getMarketProgram(networkType, rpc, wallet as IWallet)

        const ticks = await Promise.all(
          positionList.map(async position => {
            const pair = new Pair(position.poolData.tokenX, position.poolData.tokenY, {
              fee: position.poolData.fee,
              tickSpacing: position.poolData.tickSpacing
            })

            return Promise.all([
              marketProgram.getTick(pair, position.lowerTickIndex),
              marketProgram.getTick(pair, position.upperTickIndex)
            ])
          })
        )

        const total = positionList.reduce((acc, position, i) => {
          const [lowerTick, upperTick] = ticks[i]
          const [bnX, bnY] = calculateClaimAmount({
            position,
            tickLower: lowerTick,
            tickUpper: upperTick,
            tickCurrent: position.poolData.currentTickIndex,
            feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
            feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
          })

          const xValue =
            +printBN(bnX, position.tokenX.decimals) *
            (prices[position.tokenX.assetAddress.toString()] ?? 0)
          const yValue =
            +printBN(bnY, position.tokenY.decimals) *
            (prices[position.tokenY.assetAddress.toString()] ?? 0)

          return acc + xValue + yValue
        }, 0)

        setTotalUnclaimedFee(isFinite(total) ? total : 0)
      } catch (error) {
        console.error('Error calculating unclaimed fees:', error)
        setTotalUnclaimedFee(0)
      }
    }

    if (Object.keys(prices).length > 0) {
      calculateUnclaimedFee()
    }
  }, [positionList, prices, networkType, rpc])

  return totalUnclaimedFee
}
