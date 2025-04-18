import TokenListItem from '../TokenListItem/TokenListItem'
import React, { useEffect, useMemo, useState } from 'react'
import { colors, theme } from '@static/theme'
import useStyles from './style'
import { Grid, useMediaQuery } from '@mui/material'
import {
  BTC_TEST,
  NetworkType,
  SortTypeTokenList,
  USDC_TEST,
  WETH_TEST
} from '@store/consts/static'
import { PaginationList } from '@common/Pagination/Pagination'
import NotFoundPlaceholder from '../NotFoundPlaceholder/NotFoundPlaceholder'
import { VariantType } from 'notistack'
import { Keypair } from '@solana/web3.js'
import classNames from 'classnames'
import { TableBoundsLabel } from '@common/TableBoundsLabel/TableBoundsLabel'

export interface ITokensListData {
  icon: string
  name: string
  symbol: string
  price: number
  volume: number
  TVL: number
  address: string
  isUnknown: boolean
}

export interface ITokensList {
  initialLength: number
  data: ITokensListData[]
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  isLoading: boolean
}

const ITEMS_PER_PAGE = 10

const tokens = [BTC_TEST, USDC_TEST, WETH_TEST]

const generateMockData = () => {
  return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
    icon: tokens[index % tokens.length].logoURI,
    name: tokens[index % tokens.length].name,
    symbol: tokens[index % tokens.length].symbol,
    price: Math.random() * 100,
    volume: Math.random() * 10000,
    TVL: Math.random() * 10000,
    address: Keypair.generate().publicKey.toString(),
    isUnknown: false
  }))
}

const TokensList: React.FC<ITokensList> = ({
  data,
  initialLength,
  network,
  copyAddressHandler,
  isLoading
}) => {
  const [initialDataLength, setInitialDataLength] = useState(initialLength)
  const { classes } = useStyles()
  const [page, setPage] = useState(1)
  const [sortType, setSortType] = React.useState(SortTypeTokenList.VOLUME_DESC)

  const isXsDown = useMediaQuery(theme.breakpoints.down('xs'))

  const sortedData = useMemo(() => {
    if (isLoading) {
      return generateMockData()
    }

    switch (sortType) {
      case SortTypeTokenList.NAME_ASC:
        return data.sort((a, b) =>
          isXsDown
            ? a.symbol.localeCompare(b.symbol)
            : `${a.name} (${a.symbol})`.localeCompare(`${b.name} (${b.symbol})`)
        )
      case SortTypeTokenList.NAME_DESC:
        return data.sort((a, b) =>
          isXsDown
            ? b.symbol.localeCompare(a.symbol)
            : `${b.name} (${b.symbol})`.localeCompare(`${a.name} (${a.symbol})`)
        )
      case SortTypeTokenList.PRICE_ASC:
        return data.sort((a, b) => a.price - b.price)
      case SortTypeTokenList.PRICE_DESC:
        return data.sort((a, b) => b.price - a.price)
      // case SortTypeTokenList.CHANGE_ASC:
      //   return data.sort((a, b) => a.priceChange - b.priceChange)
      // case SortTypeTokenList.CHANGE_DESC:
      //   return data.sort((a, b) => b.priceChange - a.priceChange)
      case SortTypeTokenList.VOLUME_ASC:
        return data.sort((a, b) => (a.volume === b.volume ? a.TVL - b.TVL : a.volume - b.volume))
      case SortTypeTokenList.VOLUME_DESC:
        return data.sort((a, b) => (a.volume === b.volume ? b.TVL - a.TVL : b.volume - a.volume))
      case SortTypeTokenList.TVL_ASC:
        return data.sort((a, b) => (a.TVL === b.TVL ? a.volume - b.volume : a.TVL - b.TVL))
      case SortTypeTokenList.TVL_DESC:
        return data.sort((a, b) => (a.TVL === b.TVL ? b.volume - a.volume : b.TVL - a.TVL))
    }
  }, [data, sortType, isXsDown])
  useEffect(() => {
    setInitialDataLength(initialLength)
  }, [initialLength])

  useEffect(() => {
    setPage(1)
  }, [data])

  const handleChangePagination = (page: number): void => {
    setPage(page)
  }

  const getEmptyRowsCount = () => {
    const displayedItems = paginator(page).data.length
    const rowNumber = initialDataLength < 10 ? initialDataLength : 10

    return Math.max(rowNumber - displayedItems, 0)
  }

  function paginator(currentPage: number) {
    const page = currentPage || 1
    const perPage = 10
    const offset = (page - 1) * perPage
    const paginatedItems = sortedData.slice(offset).slice(0, 10)
    const totalPages = Math.ceil(data.length / perPage)

    return {
      page: page,
      totalPages: totalPages,
      data: paginatedItems
    }
  }

  const totalItems = sortedData.length
  const lowerBound = useMemo(() => (page - 1) * 10 + 1, [page])
  const upperBound = useMemo(() => Math.min(page * 10, totalItems), [totalItems, page])

  const pages = Math.ceil(data.length / 10)
  const height = initialDataLength > 10 ? 'auto' : 69
  return (
    <Grid
      container
      classes={{ root: classes.container }}
      className={classNames({ [classes.loadingOverlay]: isLoading })}>
      <>
        <TokenListItem displayType='header' onSort={setSortType} sortType={sortType} />
        {data.length > 0 || isLoading ? (
          <>
            {paginator(page).data.map((token, index) => {
              return (
                <TokenListItem
                  key={index}
                  displayType='tokens'
                  itemNumber={index + 1 + (page - 1) * 10}
                  icon={token.icon}
                  name={token.name}
                  symbol={token.symbol}
                  price={token.price}
                  // priceChange={token.priceChange}
                  volume={token.volume}
                  TVL={token.TVL}
                  hideBottomLine={pages === 1 && index + 1 === data.length}
                  address={token.address}
                  isUnknown={token.isUnknown}
                  network={network}
                  copyAddressHandler={copyAddressHandler}
                />
              )
            })}
            {getEmptyRowsCount() > 0 &&
              new Array(getEmptyRowsCount())
                .fill('')
                .map((_, index) => (
                  <div key={`empty-row-${index}`} className={classNames(classes.emptyRow)} />
                ))}
          </>
        ) : (
          <NotFoundPlaceholder title='No tokens found...' isStats />
        )}
        <Grid
          className={classes.pagination}
          sx={{
            height: height,
      borderTop: `1px solid ${colors.invariant.light}`
          }}>
          {pages > 1 && (
            <TableBoundsLabel
              lowerBound={lowerBound}
              totalItems={totalItems}
              upperBound={upperBound}
              borderTop={false}>
              <PaginationList
                pages={pages}
                defaultPage={1}
                handleChangePage={handleChangePagination}
                variant='center'
              />
            </TableBoundsLabel>
          )}
        </Grid>
      </>
    </Grid>
  )
}

export default TokensList
