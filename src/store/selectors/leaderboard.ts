import { createSelector } from '@reduxjs/toolkit'
import {
  ILeaderboardStore,
  leaderboardSliceName,
  UserStats,
  LeaderboardEntry
} from '../reducers/leaderboard'
import { AnyProps, keySelectors } from './helpers'
import { PublicKey } from '@solana/web3.js'

const store = (s: AnyProps) => s[leaderboardSliceName] as ILeaderboardStore

// Basic selectors
export const {
  isLoading,
  currentUser,
  leaderboard,
  currentPage,
  itemsPerPage,
  totalItems,
  top3Scorers
} = keySelectors(store, [
  'currentPage',
  'totalItems',
  'itemsPerPage',
  'isLoading',
  'currentUser',
  'top3Scorers',
  'leaderboard'
])

export const leaderboardSelectors = {
  loading: isLoading,
  currentPage,
  itemsPerPage,
  totalItems,
  top3Scorers,
  currentUser,
  leaderboard
}

export const topRankedUsers = createSelector(leaderboard, (leaderboardData: LeaderboardEntry[]) =>
  [...leaderboardData].sort((a, b) => a.rank - b.rank)
)

export const top10Users = createSelector(topRankedUsers, (sortedUsers: LeaderboardEntry[]) =>
  sortedUsers.slice(0, 10)
)

export const usersByPoints = createSelector(leaderboard, (leaderboardData: LeaderboardEntry[]) =>
  [...leaderboardData].sort((a, b) => b.points - a.points)
)

export const last24HoursTopUsers = createSelector(
  leaderboard,
  (leaderboardData: LeaderboardEntry[]) =>
    [...leaderboardData]
      .sort((a, b) => b.last24hPoints - a.last24hPoints)
      .filter(user => user.last24hPoints > 0)
)

export const getUserByAddress = createSelector(
  leaderboard,
  (leaderboardData: LeaderboardEntry[]) => (address: string | PublicKey) => {
    const searchAddress = address instanceof PublicKey ? address.toString() : address
    return leaderboardData.find(user => user.address.toString() === searchAddress)
  }
)

export const getCurrentUserRank = createSelector(
  currentUser,
  (user: UserStats | null) => user?.rank ?? null
)

export const getTotalUsersCount = createSelector(
  leaderboard,
  (leaderboardData: LeaderboardEntry[]) => leaderboardData.length
)

export const getActiveUsersLast24h = createSelector(
  leaderboard,
  (leaderboardData: LeaderboardEntry[]) =>
    leaderboardData.filter(user => user.last24hPoints > 0).length
)

export const getUserPosition = createSelector(
  [leaderboard, (_, address: string | PublicKey) => address],
  (leaderboardData: LeaderboardEntry[], address: string | PublicKey) => {
    const searchAddress = address instanceof PublicKey ? address.toString() : address
    const index = leaderboardData.findIndex(user => user.address.toString() === searchAddress)
    return index !== -1 ? index + 1 : null
  }
)

export const getDashboardStats = createSelector(
  [getTotalUsersCount, getActiveUsersLast24h, top10Users],
  (totalUsers, activeUsers, topUsers) => ({
    totalUsers,
    activeUsers,
    topUsers
  })
)

export const getLeaderboardPage = createSelector(
  [leaderboard, (_, page: number, pageSize: number = 10) => ({ page, pageSize })],
  (leaderboardData: LeaderboardEntry[], { page, pageSize }) => {
    const start = page * pageSize
    return leaderboardData.slice(start, start + pageSize)
  }
)
