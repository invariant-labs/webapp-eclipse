export interface Token {
  name: string
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
  id: string
  symbol: string
  icon: string
  value: number
  amount: number
}
