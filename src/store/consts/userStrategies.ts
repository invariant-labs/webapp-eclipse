import { StrategyConfig } from '@store/types/userOverview'
import {
  BITZ_MAIN,
  sBITZ_MAIN,
  SOL_MAIN,
  TETH_MAIN,
  TUSD_MAIN,
  USDC_MAIN,
  WETH_MAIN
} from './static'
export const DEFAULT_FEE_TIER = '0_10'
export const STRATEGIES: StrategyConfig[] = [
  {
    tokenAddressA: WETH_MAIN.address.toString(),
    tokenAddressB: USDC_MAIN.address.toString(),
    feeTier: '0_09'
  },
  {
    tokenAddressA: SOL_MAIN.address.toString(),
    tokenAddressB: WETH_MAIN.address.toString(),
    feeTier: '0_09'
  },
  {
    tokenAddressA: TETH_MAIN.address.toString(),
    tokenAddressB: WETH_MAIN.address.toString(),
    feeTier: '0_01'
  },
  {
    tokenAddressA: BITZ_MAIN.address.toString(),
    tokenAddressB: WETH_MAIN.address.toString(),
    feeTier: '1_00'
  },

  {
    tokenAddressA: TUSD_MAIN.address.toString(),
    tokenAddressB: USDC_MAIN.address.toString(),
    feeTier: '0_01'
  },
  {
    tokenAddressA: sBITZ_MAIN.address.toString(),
    tokenAddressB: WETH_MAIN.address.toString(),
    feeTier: '1_00'
  }
]
