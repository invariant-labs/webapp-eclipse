import { StrategyConfig } from '@store/types/userOverview'

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
