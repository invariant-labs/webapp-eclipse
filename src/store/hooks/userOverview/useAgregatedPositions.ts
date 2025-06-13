import { ISinglePositionData } from '@components/Portfolio/Overview/Overview/Overview'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { PublicKey } from '@solana/web3.js'
import { TokenPositionEntry } from '@store/types/userOverview'
import { printBN } from '@utils/utils'
import { useMemo } from 'react'
interface TokenPosition {
  tokenX: {
    symbol: string
    decimals: number
    name: string
    assetAddress: PublicKey
    logoURI: string
  }
  tokenY: {
    symbol: string
    name: string
    decimals: number
    assetAddress: PublicKey
    logoURI: string
  }
  liquidity: number
  upperTickIndex: number
  lowerTickIndex: number
  poolData: {
    sqrtPrice: number
  }
  id: string
}

const calculateTokenValue = (
  position: TokenPosition,
  isTokenX: boolean,
  prices: Record<string, number>
): { value: number; amountBN: number } => {
  const token = isTokenX ? position.tokenX : position.tokenY
  const getValue = isTokenX ? getX : getY

  const amount = getValue(
    position.liquidity,
    calculatePriceSqrt(position.upperTickIndex),
    position.poolData.sqrtPrice,
    calculatePriceSqrt(position.lowerTickIndex)
  )

  return {
    value: +printBN(amount, token.decimals) * prices[token.assetAddress.toString()] || 0,
    amountBN: amount
  }
}

const createPositionEntry = (
  position: TokenPosition,
  isTokenX: boolean,
  value: number,
  isPriceWarning: boolean
): TokenPositionEntry => {
  const token = isTokenX ? position.tokenX : position.tokenY

  return {
    token: token.symbol,
    value,
    name: token.name,
    logo: token.logoURI,
    positionId: position.id,
    isPriceWarning: isPriceWarning
  }
}

const updateOrCreatePosition = (
  positions: TokenPositionEntry[],
  position: TokenPosition,
  isTokenX: boolean,
  prices: Record<string, number>
): TokenPositionEntry[] => {
  const token = isTokenX ? position.tokenX : position.tokenY
  const { value, amountBN } = calculateTokenValue(position, isTokenX, prices)

  const existingPosition = positions.find(p => p.token === token.symbol)

  if (existingPosition) {
    existingPosition.value += value
    existingPosition.isPriceWarning =
      !prices?.[token.assetAddress.toString()] && +amountBN.toString() > 0
    return positions
  }

  return [
    ...positions,
    createPositionEntry(
      position,
      isTokenX,
      value,
      !prices?.[token.assetAddress.toString()] && +amountBN.toString() > 0
    )
  ]
}

export const useAgregatedPositions = (
  positionList: ISinglePositionData[],
  prices: Record<string, number>
) => {
  const positions = useMemo(() => {
    return positionList.reduce((acc: TokenPositionEntry[], position) => {
      acc = updateOrCreatePosition(acc, position, true, prices)
      acc = updateOrCreatePosition(acc, position, false, prices)
      return acc
    }, [])
  }, [positionList, prices])
  return { positions }
}
