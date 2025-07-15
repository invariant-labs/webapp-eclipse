import { ISaleStore, saleSliceName } from '../reducers/sale'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[saleSliceName] as ISaleStore

export const {
  saleStats,
  userStats,
  isLoadingSaleStats,
  isLoadingUserStats,
  proofOfInclusion,
  isLoadingProof,
  deposit
} = keySelectors(store, [
  'saleStats',
  'userStats',
  'isLoadingSaleStats',
  'isLoadingUserStats',
  'isLoadingProof',
  'proofOfInclusion',
  'deposit'
])

export const saleSelectors = {
  saleStats,
  userStats,
  isLoadingSaleStats,
  isLoadingUserStats,
  isLoadingProof,
  proofOfInclusion,
  deposit
}
