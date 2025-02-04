import { TokenPositionsStore, tokenPositionsSliceName } from '../reducers/overview'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[tokenPositionsSliceName] as TokenPositionsStore

export const { positions, totalAssets, totalUnclaimedFee } = keySelectors(store, [
  'positions',
  'totalAssets',
  'totalUnclaimedFee'
])

export const overviewSelectors = {
  positions,
  totalAssets,
  totalUnclaimedFee
}
