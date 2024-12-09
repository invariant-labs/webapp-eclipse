import React, { useMemo, useCallback } from 'react'
import { Box, Grid } from '@mui/material'
import { useStyles } from './style'
import LeaderboardItem from '../LeaderboardItem/LeaderboardItem'
import PurpleWaves from '@static/png/purple_waves.png'
import GreenWaves from '@static/png/green_waves.png'
import { PaginationList } from '@components/Pagination/Pagination'
import NotFoundPlaceholder from '@components/Stats/NotFoundPlaceholder/NotFoundPlaceholder'
import { colors } from '@static/theme'

interface LeaderboardEntry {
  displayType: 'header' | 'item'
  address?: string
  totalPoints?: number
  tokenIndex?: number
  hideBottomLine?: boolean
  pointsIncome?: number
  liquidityPositions?: number
}

interface LeaderboardListProps {
  data: LeaderboardEntry[]
}

const ITEMS_PER_PAGE = 25

const paginateData = <T,>(data: T[], page: number, itemsPerPage: number): T[] => {
  const startIndex = (page - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}

const MemoizedLeaderboardItem = React.memo(LeaderboardItem)

const LeaderboardList: React.FC<LeaderboardListProps> = ({ data }) => {
  const { classes } = useStyles()
  const [currentPage, setCurrentPage] = React.useState(1)

  const paginatedData = useMemo(
    () => paginateData(data, currentPage, ITEMS_PER_PAGE),
    [data, currentPage]
  )

  const totalPages = useMemo(() => Math.ceil(data.length / ITEMS_PER_PAGE), [data])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  React.useEffect(() => {
    setCurrentPage(1)
  }, [data])

  const renderWaves = (position: 'top' | 'bottom', imageSrc: string) =>
    totalPages > 1 && (
      <div
        className={`${classes.waveImage} ${classes[`${position}Wave`]}`}
        style={{ alignItems: position === 'top' ? 'flex-start' : 'flex-end' }}>
        <img src={imageSrc} alt={`${position === 'top' ? 'Purple' : 'Green'} waves`} />
      </div>
    )

  return (
    <div className={classes.container}>
      {renderWaves('top', PurpleWaves)}

      <Grid container direction='column'>
        <MemoizedLeaderboardItem displayType='header' />

        <Box
          sx={{
            paddingLeft: '24px',
            paddingRight: '24px',
            background: colors.invariant.light
          }}>
          <MemoizedLeaderboardItem
            displayType='item'
            isYou
            liquidityPositions={343}
            tokenIndex={123}
            pointsIncome={345}
            totalPoints={3453}
          />
        </Box>

        <Box sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
          {data.length > 0 ? (
            paginatedData.map((element, index) => (
              <MemoizedLeaderboardItem
                key={element.address || index}
                displayType='item'
                tokenIndex={index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                liquidityPositions={element.liquidityPositions}
                pointsIncome={element.pointsIncome}
                totalPoints={element.totalPoints ?? 0}
                address={element.address}
              />
            ))
          ) : (
            <NotFoundPlaceholder title='Leaderboard empty...' />
          )}
        </Box>
      </Grid>

      {totalPages > 1 && (
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
