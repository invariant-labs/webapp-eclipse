import { BN } from '@coral-xyz/anchor'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { Market } from '@invariant-labs/sdk-eclipse/src'
import { PublicKey } from '@solana/web3.js'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'

export interface StrategyConfig {
  tokenAddressA: string
  tokenAddressB?: string
  feeTier: string
}

export interface Token {
  name: string
  decimal: number
  balance: BN
  assetsAddress: string
  coingeckoId?: string
  icon: string
}

export interface UnclaimedFee {
  id: number
  tokenX: Token
  tokenY: Token
  fee: number
  value: number
  unclaimedFee: number
}

export interface PoolAsset {
  id: number
  name: string
  fee: number
  value: number
  unclaimedFee: number
}

export interface TokenPool {
  id: PublicKey
  symbol: string
  icon: string
  isUnknown?: boolean
  value: number
  amount: number
}

export interface ProcessedPool {
  id: string
  fee: number
  lowerTickIndex: number
  upperTickIndex: number
  poolData: PoolWithAddressAndIndex
  tokenX: Token
  tokenY: Token
}

export interface TokenPositionEntry {
  token: string
  value: number
  positionId: string
  logo?: string
}

export enum LiquidityPools {
  Standard = 'Standard',
  Locked = 'Locked'
}
export interface IClaimAllFee {
  market: Market
  positions: IClaimAllFeePosition[]
  owner?: PublicKey
}
export interface IClaimAllFeePosition {
  pair: Pair
  authorityListIndex: number
  lowerTickIndex: number
  upperTickIndex: number
}
