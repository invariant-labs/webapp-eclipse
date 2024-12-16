import React, { useEffect, useRef } from 'react'
import { useStyles } from './style'
import { Box, Grid } from '@mui/material'
import Item from '../Item/Item'
import PurpleWaves from '@static/png/purple_waves.png'
import GreenWaves from '@static/png/green_waves.png'
import { PaginationList } from '@components/Pagination/Pagination'
import NotFoundPlaceholder from '@components/Stats/NotFoundPlaceholder/NotFoundPlaceholder'
import { colors } from '@static/theme'

export interface ListElement {
  displayType: string
  address?: string
  totalPoints?: number
  tokenIndex?: number
  isYou?: boolean
  hideBottomLine?: boolean
  pointsIncome?: number
  liquidityPositions?: number
}

interface ItemListProps {
  data: ListElement[]
}

const ItemList: React.FC<ItemListProps> = ({ data }) => {
  const { classes } = useStyles()
  const containerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = React.useState(1)

  useEffect(() => {
    setPage(1)
  }, [data])

  const paginator = (currentPage: number) => {
    const page = currentPage || 1
    const perPage = 25
    const offest = (page - 1) * perPage

    return data.slice(offest).slice(0, perPage)
  }
  const pages = Math.ceil(data.length / 25)
  const handleChangePagination = (currentPage: number) => setPage(currentPage)

  return (
    <div className={classes.container} ref={containerRef}>
      <div
        className={`${classes.waveImage} ${classes.topWave}`}
        style={{ alignItems: 'flex-start' }}>
        <img src={PurpleWaves} alt='Purple waves' />
      </div>

      <Grid container direction='column'>
        <>
          <Item displayType='header' />
          <Box
            sx={{ paddingLeft: '24px', paddingRight: '24px', background: colors.invariant.light }}>
            <Item
              displayType='token'
              isYou
              liquidityPositions={343}
              tokenIndex={123}
              pointsIncome={345}
              totalPoints={3453}
            />
          </Box>
          <Box sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
            {data.length > 0 ? (
              paginator(page).map((element, index) => (
                <Item
                  displayType='token'
                  tokenIndex={index + 1 + (page - 1) * 10}
                  liquidityPositions={element.liquidityPositions}
                  pointsIncome={element.pointsIncome}
                  totalPoints={element.totalPoints}
                  address={element.address}
                />
              ))
            ) : (
              <NotFoundPlaceholder title='Leaderboard empty...' />
            )}
          </Box>
        </>
      </Grid>
      <Box sx={{ paddingLeft: '24px', paddingRight: '24px' }}>
        {pages > 1 ? (
          <Grid className={classes.pagination}>
            <PaginationList
              pages={pages}
              defaultPage={1}
              handleChangePage={handleChangePagination}
              variant='center'
            />
          </Grid>
        ) : null}
      </Box>
      {pages > 1 ? (
        <div
          className={`${classes.waveImage} ${classes.bottomWave}`}
          style={{ alignItems: 'flex-end' }}>
          <img src={GreenWaves} alt='Green waves' />
        </div>
      ) : null}
    </div>
  )
}

export default ItemList
