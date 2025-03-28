import { ISinglePositionData } from '@components/OverviewYourPositions/components/Overview/Overview'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { PublicKey } from '@solana/web3.js'
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

export interface TokenPositionEntry {
  token: string
  value: number
  name: string
  logo: string
  positionId: string
  isPriceWarning: boolean
}

const calculateTokenValue = (
  position: TokenPosition,
  isTokenX: boolean,
  prices: Record<string, number>
): number => {
  const token = isTokenX ? position.tokenX : position.tokenY
  const getValue = isTokenX ? getX : getY

  const amount = getValue(
    position.liquidity,
    calculatePriceSqrt(position.upperTickIndex),
    position.poolData.sqrtPrice,
    calculatePriceSqrt(position.lowerTickIndex)
  )

  return +printBN(amount, token.decimals) * prices[token.assetAddress.toString()]
}

const createPositionEntry = (
  position: TokenPosition,
  isTokenX: boolean,
  value: number
): TokenPositionEntry => {
  const token = isTokenX ? position.tokenX : position.tokenY

  return {
    token: token.symbol,
    value,
    name: token.name,
    logo: token.logoURI,
    positionId: position.id,
    isPriceWarning: false
  }
}

const updateOrCreatePosition = (
  positions: TokenPositionEntry[],
  position: TokenPosition,
  isTokenX: boolean,
  prices: Record<string, number>
): TokenPositionEntry[] => {
  const token = isTokenX ? position.tokenX : position.tokenY
  const value = calculateTokenValue(position, isTokenX, prices)

  const existingPosition = positions.find(p => p.token === token.symbol)

  if (existingPosition) {
    existingPosition.value += value
    existingPosition.isPriceWarning = !prices[token.assetAddress.toString()]
    return positions
  }

  return [...positions, createPositionEntry(position, isTokenX, value)]
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
