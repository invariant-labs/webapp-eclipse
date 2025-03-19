import { createSelector } from '@reduxjs/toolkit'
import {
  ILeaderboardStore,
  ILpEntry,
  ISwapEntry,
  ITotalEntry,
  leaderboardSliceName
} from '../reducers/leaderboard'
import { AnyProps, keySelectors } from './helpers'
import { IPromotedPool } from '@store/sagas/leaderboard'

const store = (s: AnyProps) => s[leaderboardSliceName] as ILeaderboardStore

export const {
  type,
  isLoading,
  currentUser,
  leaderboard,
  currentPage,
  itemsPerPage,
  totalItems,
  top3Scorers,
  config,
  priceFeeds,
  contentPoints
} = keySelectors(store, [
  'type',
  'currentPage',
  'totalItems',
  'itemsPerPage',
  'isLoading',
  'currentUser',
  'top3Scorers',
  'leaderboard',
  'config',
  'priceFeeds',
  'contentPoints'
])

export const leaderboardSelectors = {
  type,
  loading: isLoading,
  currentPage,
  itemsPerPage,
  totalItems,
  top3Scorers,
  currentUser,
  leaderboard,
  config,
  contentPoints
}

export const getPromotedPools = createSelector(
  config,
  (config: { refreshTime: number; pointsDecimal: number; promotedPools: IPromotedPool[] }) =>
    config.promotedPools
)

export const getContentProgramDates = createSelector(config, config => {
  return { start: config.contentProgramDateStart, end: config.contentProgramDateEnd }
})

export const lastTimestamp = createSelector(config, config => config.lastSnapTimestamp)
export const pointsPerUsd = createSelector(config, config => config.pointsPerUsd)
export const swapPairs = createSelector(config, config => config.swapPairs)
export const swapMultiplier = createSelector(config, config => config.swapMultiplier)
export const feeds = createSelector(priceFeeds, priceFeeds => priceFeeds)

export const topRankedLpUsers = createSelector(
  leaderboard,
  (leaderboardData: { total: ITotalEntry[]; swap: ISwapEntry[]; lp: ILpEntry[] }) => {
    return [...leaderboardData.lp].sort((a, b) => a.rank - b.rank)
  }
)
export const topRankedSwapUsers = createSelector(
  leaderboard,
  (leaderboardData: { total: ITotalEntry[]; swap: ISwapEntry[]; lp: ILpEntry[] }) => {
    return [...leaderboardData.swap].sort((a, b) => a.rank - b.rank)
  }
)
export const topRankedTotalUsers = createSelector(
  leaderboard,
  (leaderboardData: { total: ITotalEntry[]; swap: ISwapEntry[]; lp: ILpEntry[] }) => {
    return [...leaderboardData.total].sort((a, b) => a.rank - b.rank)
  }
)
export const getLeaderboardQueryParams = createSelector(
  itemsPerPage,
  currentPage,
  (pageSize, page) => {
    return { pageSize, page }
  }
)
