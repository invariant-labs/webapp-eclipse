export interface StrategyConfig {
  tokenSymbolA: string
  tokenSymbolB?: string
  feeTier: string
}

export const STRATEGIES: StrategyConfig[] = [
  {
    tokenSymbolA: 'ETH',
    tokenSymbolB: 'USDC',
    feeTier: '0_09'
  },
  {
    tokenSymbolA: 'tETH',
    tokenSymbolB: 'ETH',
    feeTier: '0_01'
  }
]
