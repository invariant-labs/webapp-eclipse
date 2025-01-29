import { IPositionItem } from '@components/PositionsList/types'
import { PublicKey } from '@solana/web3.js'
import { PoolWithAddressAndIndex } from '@store/selectors/positions'

export interface Token {
  name: string
  decimal: number
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
  value: number
  amount: number
}

export interface ProcessedPool {
  id: string
  fee: number
  lowerTickIndex: number
  upperTickIndex: number
  position: IPositionItem
  poolData: PoolWithAddressAndIndex
  tokenX: {
    decimal: number
    icon: string
    name: string
  }
  tokenY: {
    decimal: number
    icon: string
    name: string
  }
  unclaimedFee: number
  value: number
}
