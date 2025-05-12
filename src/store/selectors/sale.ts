import { ISaleStore, saleSliceName } from '../reducers/sale'
import { AnyProps, keySelectors } from './helpers'

const store = (s: AnyProps) => s[saleSliceName] as ISaleStore

export const { saleStats, userStats, isLoadingSaleStats, isLoadingUserStats, deposit } =
  keySelectors(store, [
    'saleStats',
    'userStats',
    'isLoadingSaleStats',
    'isLoadingUserStats',
    'deposit'
  ])

export const saleSelectors = {
  saleStats,
  userStats,
  isLoadingSaleStats,
  isLoadingUserStats,
  deposit
}
