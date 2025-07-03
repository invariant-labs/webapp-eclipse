import { IStatsStore, sbitzStatsSliceName } from '../reducers/sbitz-stats'
import { keySelectors, AnyProps } from './helpers'

const store = (s: AnyProps) => s[sbitzStatsSliceName] as IStatsStore

export const {
  timestamp,
  bitzStaked,
  sBitzTVL,
  bitzSupply,
  totalBitzStaked,
  sbitzHolders,
  sbitzSupply,
  bitzHolders,
  rewards24h,
  sbitzSupplyPlot,
  bitzStakedPlot,
  sbitzTVLPlot,
  isLoading,
  lastTimestamp,
  forecastInterval
} = keySelectors(store, [
  'timestamp',
  'bitzStaked',
  'sBitzTVL',
  'bitzSupply',
  'totalBitzStaked',
  'sbitzHolders',
  'sbitzSupply',
  'bitzHolders',
  'rewards24h',
  'sbitzSupplyPlot',
  'bitzStakedPlot',
  'sbitzTVLPlot',
  'isLoading',
  'lastTimestamp',
  'forecastInterval'
])

export const stakingSelectors = {
  timestamp,
  bitzStaked,
  sBitzTVL,
  bitzSupply,
  totalBitzStaked,
  sbitzHolders,
  sbitzSupply,
  bitzHolders,
  rewards24h,
  sbitzSupplyPlot,
  bitzStakedPlot,
  sbitzTVLPlot,
  isLoading,
  lastTimestamp,
  forecastInterval
}

export default stakingSelectors
