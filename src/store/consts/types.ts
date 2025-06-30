import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { NetworkType } from './static'
import { Position } from '@invariant-labs/sdk-eclipse/lib/market'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'

declare global {
  interface Window {
    solana: any
  }

  interface ImportMeta {
    globEager: (x: string) => { [propertyName: string]: { default: string } }
  }
}

interface ActionsBasicType {
  [k: string]: ActionCreatorWithPayload<any>
}

export type PayloadType<actions extends ActionsBasicType> = {
  [k in keyof actions]: Parameters<actions[k]>[0]
}

export enum SwapError {
  InsufficientLiquidity,
  AmountIsZero,
  NoRouteFound,
  MaxSwapStepsReached,
  StateOutdated,
  Unknown
}

export interface Token {
  tokenProgram?: PublicKey
  symbol: string
  address: PublicKey
  decimals: number
  name: string
  logoURI: string
  coingeckoId?: string
  isUnknown?: boolean
}

export interface ISelectNetwork {
  networkType: NetworkType
  rpc: string
  rpcName?: string
}

export interface PrefixConfig {
  B?: number
  M?: number
  K?: number
}

export type SimulateResult = {
  amountOut: BN
  poolIndex: number
  AmountOutWithFee: BN
  estimatedPriceAfterSwap: BN
  minimumReceived: BN
  priceImpact: BN
  error: string[]
}

export interface FormatNumberThreshold {
  value: number
  decimals: number
  divider?: number
}

export type PositionOpeningMethod = 'range' | 'concentration'

export interface TokenPriceData {
  price: number
}

export interface CoingeckoApiPriceData {
  id: string
  current_price: number
  price_change_percentage_24h: number
}

export interface CoingeckoPriceData {
  price: number
  priceChange: number
}

export interface SnapshotValueData {
  tokenBNFromBeginning: string
  usdValue24: number
}

export interface PrefixConfig {
  B?: number
  M?: number
  K?: number
}

export interface ParsedBN {
  BN: BN
  decimal: number
}

export interface IncentiveRewardData {
  apy: number
  apySingleTick: number
  total: number
  token: string
}

export interface PoolSnapshot {
  timestamp: number
  volumeX: SnapshotValueData
  volumeY: SnapshotValueData
  liquidityX: SnapshotValueData
  liquidityY: SnapshotValueData
  feeX: SnapshotValueData
  feeY: SnapshotValueData
}

export interface ISelectChain {
  name: Chain
  address: string
}

export enum Chain {
  Solana = 'Solana',
  AlephZero = 'Aleph Zero',
  Eclipse = 'Eclipse',
  Sonic = 'Sonic',
  Vara = 'Vara'
}

export interface SnapshotValueData {
  tokenBNFromBeginning: string
  usdValue24: number
}

export interface PoolSnapshot {
  timestamp: number
  volumeX: SnapshotValueData
  volumeY: SnapshotValueData
  liquidityX: SnapshotValueData
  liquidityY: SnapshotValueData
  feeX: SnapshotValueData
  feeY: SnapshotValueData
}

export interface TokenStatsDataWithString {
  address: string
  price: number
  volume24: number
  tvl: number
}

export interface TimeData {
  timestamp: number
  value: number
}

export interface PoolStatsDataWithString {
  poolAddress: string
  tokenX: string
  tokenY: string
  fee: number
  volume24: number
  tvl: number
  apy: number
}

export interface SnapshotValueData {
  tokenBNFromBeginning: string
  usdValue24: number
}

export interface PoolSnapshot {
  timestamp: number
  volumeX: SnapshotValueData
  volumeY: SnapshotValueData
  liquidityX: SnapshotValueData
  liquidityY: SnapshotValueData
  feeX: SnapshotValueData
  feeY: SnapshotValueData
}

export interface FullSnap {
  volume24: {
    value: number
    change: number | null
  }
  tvl24: {
    value: number
    change: number | null
  }
  fees24: {
    value: number
    change: number | null
  }
  tokensData: TokenStatsDataWithString[]
  poolsData: PoolStatsDataWithString[]
  volumePlot: TimeData[]
  liquidityPlot: TimeData[]
}

export interface TokenStatsDataWithString {
  address: string
  price: number
  volume24: number
  tvl: number
}

export interface TimeData {
  timestamp: number
  value: number
}

export interface PoolStatsDataWithString {
  poolAddress: string
  tokenX: string
  tokenY: string
  fee: number
  volume24: number
  tvl: number
  apy: number
}

export enum WalletType {
  NIGHTLY = 'NIGHTLY',
  NIGHTLY_WALLET = 'NIGHTLY_WALLET',
  BACKPACK = 'BACKPACK',
  SALMON = 'SALMON',
  OKX = 'OKX'
}

export interface IPriceData {
  data: Record<string, { price: number }>
  lastUpdateTimestamp: number
}

export interface EligibleAddresses {
  rewardKey: string
  addresses: string[]
}

export interface Reward {
  name: string
  image: string
  distributionDate: string
  eligible: string
  type: string
  addresses: string[]
}
export interface IPositionItem {
  tokenXName: string
  tokenYName: string
  tokenXIcon: string
  tokenYIcon: string
  tokenXLiq: number
  poolAddress: PublicKey
  position: Position
  tokenYLiq: number
  fee: number
  min: number
  max: number
  valueX: number
  valueY: number
  id: string
  address: string
  isActive?: boolean
  currentPrice: number
  network: NetworkType
  isFullRange: boolean
  isLocked: boolean
  poolData: PoolWithAddressAndIndex
  liquidity: BN
  unclaimedFeesInUSD: { value: number; loading: boolean; isClaimAvailable: boolean }
}

export interface ILiquidityToken {
  name: string
  icon: string
  decimal: number
  liqValue: number
  claimValue: number
  balance: number
  usdValue?: number
}

export interface INavigatePosition {
  tokenXName: string
  tokenYName: string
  tokenXIcon: string
  tokenYIcon: string
  fee: number
  id: string
}
export interface TokenSerialized {
  symbol: string
  address: string
  decimals: number
  name: string
  logoURI: string
  coingeckoId?: string
  isUnknown?: boolean
  tokenProgram?: string
}

export enum StakeSwitch {
  Stake = 'Stake',
  Unstake = 'Unstake'
}
