import React, { useMemo, useCallback } from 'react'
import { Box, Grid } from '@mui/material'
import { useStyles } from './style'
import LeaderboardItem from '../LeaderboardItem/LeaderboardItem'
import PurpleWaves from '@static/png/purple_waves.png'
import GreenWaves from '@static/png/green_waves.png'
import { PaginationList } from '@components/Pagination/Pagination'
import NotFoundPlaceholder from '@components/Stats/NotFoundPlaceholder/NotFoundPlaceholder'
import loader from '@static/gif/loader.gif'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useDispatch, useSelector } from 'react-redux'
import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { leaderboardSelectors } from '@store/selectors/leaderboard'
import { actions } from '@store/reducers/leaderboard'
interface LeaderboardEntry {
  hideBottomLine?: boolean
  points?: BN
  positions?: number
  last24hPoints?: BN
  rank?: number
  address?: PublicKey
}

interface LeaderboardListProps {
  data: LeaderboardEntry[]
  isLoading?: boolean
}

const generateMockData = (itemsPerPage: number): LeaderboardEntry[] => {
  return Array.from({ length: itemsPerPage }, (_, index) => ({
    displayType: 'item',
    address: Keypair.generate().publicKey,
    points: 10000 - index * 100,
    pointsIncome: 1000 - index * 10,
    liquidityPositions: 100 - index,
    tokenIndex: index + 1
  }))
}

const MemoizedLeaderboardItem = React.memo(LeaderboardItem)

const LeaderboardList: React.FC<LeaderboardListProps> = ({ data, isLoading = false }) => {
  const { classes } = useStyles()
  const walletStatus = useSelector(status)
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const userStats = useSelector(leaderboardSelectors.currentUser)

  const dispatch = useDispatch()
  const currentPage = useSelector(leaderboardSelectors.currentPage)
  const totalItems = useSelector(leaderboardSelectors.totalItems)
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)

  const displayData = useMemo(() => {
    return isLoading ? generateMockData(itemsPerPage) : data
  }, [isLoading, data])

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [displayData])

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(actions.getLeaderboardData({ page, itemsPerPage }))
    },
    [dispatch, itemsPerPage]
  )
  React.useEffect(() => {
    console.log({ currentPage, totalItems, itemsPerPage, totalPages })
  }, [])

  const renderWaves = (position: 'top' | 'bottom', imageSrc: string) =>
    totalPages > 1 &&
    data.length > 20 && (
      <div
        className={`${classes.waveImage} ${classes[`${position}Wave`]}`}
        style={{ alignItems: position === 'top' ? 'flex-start' : 'flex-end' }}>
        <img src={imageSrc} alt={`${position === 'top' ? 'Purple' : 'Green'} waves`} />
      </div>
    )

  return (
    <div className={classes.container}>
      {renderWaves('top', PurpleWaves)}

      <Grid container direction='column' className={isLoading ? classes.loadingOverlay : ''}>
        <MemoizedLeaderboardItem displayType='header' />
        {isLoading && <img src={loader} className={classes.loading} alt='Loading' />}

        {isConnected && userStats && (
          <MemoizedLeaderboardItem
            key={userStats.rank}
            displayType='item'
            rank={userStats.rank}
            isYou
            positions={userStats.positions}
            last24hPoints={userStats.last24hPoints}
            points={userStats.points ?? 0}
            address={userStats.address}
          />
        )}
        <Box sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
          {displayData.length > 0 ? (
            data.map((element, index) => (
              <MemoizedLeaderboardItem
                key={index}
                displayType='item'
                rank={index + 1 + (currentPage - 1) * itemsPerPage}
                positions={element.positions}
                last24hPoints={element.last24hPoints}
                points={element.points ?? 0}
                address={element.address}
              />
            ))
          ) : (
            <NotFoundPlaceholder title='Leaderboard empty...' />
          )}
        </Box>
      </Grid>

      {totalPages >= 1 && (
        <Box sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
          <Grid className={classes.pagination}>
            <PaginationList
              pages={totalPages}
              defaultPage={1}
              handleChangePage={handlePageChange}
              variant='center'
            />
          </Grid>
        </Box>
      )}

      {renderWaves('bottom', GreenWaves)}
    </div>
  )
}

export default LeaderboardList
