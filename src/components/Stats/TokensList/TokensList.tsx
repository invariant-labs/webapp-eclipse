import TokenListItem from '../TokenListItem/TokenListItem'
import React, { useEffect, useMemo, useState } from 'react'
import { colors, theme } from '@static/theme'
import { Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import {
  BTC_TEST,
  Intervals,
  ITEMS_PER_PAGE,
  NetworkType,
  SortTypeTokenList,
  tokenSortGroups,
  USDC_TEST,
  WETH_TEST
} from '@store/consts/static'
import { InputPagination } from '@common/Pagination/InputPagination/InputPagination'
import { VariantType } from 'notistack'
import { Keypair } from '@solana/web3.js'
import { useDispatch, useSelector } from 'react-redux'
import { tokenSearch } from '@store/selectors/navigation'
import { actions } from '@store/reducers/navigation'
import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'
import { useStyles } from './style'
import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import SortTypeSelector from '../SortTypeSelector/SortTypeSelector'
import { star, starFill } from '@static/icons'

export interface ITokensListData {
  icon: string
  name: string
  symbol: string
  price: number
  volume: number
  TVL: number
  address: string
  isFavourite: boolean
  isUnknown: boolean
}

export interface ITokensList {
  initialLength: number
  data: ITokensListData[]
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  isLoading: boolean
  interval: Intervals
  switchFavouriteTokens: (tokenAddress: string) => void
  showFavourites: boolean
  handleFavouritesClick: () => void
  setSearchTokensValue: (value: ISearchToken[]) => void
  searchTokensValue: ISearchToken[]
}

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
    isUnknown: false,
    isFavourite: false
  }))
}

const TokensList: React.FC<ITokensList> = ({
  data,
  initialLength,
  network,
  copyAddressHandler,
  isLoading,
  interval,
  switchFavouriteTokens,
  handleFavouritesClick,
  searchTokensValue,
  setSearchTokensValue,
  showFavourites
}) => {
  const [initialDataLength, setInitialDataLength] = useState(initialLength)
  const { classes, cx } = useStyles()
  const dispatch = useDispatch()
  const searchParams = useSelector(tokenSearch)
  const page = searchParams.pageNumber
  const [sortType, setSortType] = React.useState(searchParams.sortType)

  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    dispatch(actions.setSearch({ section: 'statsTokens', type: 'sortType', sortType }))
  }, [sortType])

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

  const handleChangePagination = (newPage: number) => {
    dispatch(
      actions.setSearch({
        section: 'statsTokens',
        type: 'pageNumber',
        pageNumber: newPage
      })
    )
  }

  const getEmptyRowsCount = () => {
    const displayedItems = paginator(page).data.length
    const rowNumber = initialDataLength < ITEMS_PER_PAGE ? initialDataLength : ITEMS_PER_PAGE

    return Math.max(rowNumber - displayedItems, 0)
  }

  function paginator(currentPage: number) {
    const page = currentPage || 1
    const offset = (page - 1) * ITEMS_PER_PAGE
    const paginatedItems = sortedData.slice(offset).slice(0, ITEMS_PER_PAGE)
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)

    return {
      page: page,
      totalPages: totalPages,
      data: paginatedItems
    }
  }

  const totalItems = useMemo(() => sortedData.length, [sortedData])
  const lowerBound = useMemo(() => (page - 1) * ITEMS_PER_PAGE + 1, [page])
  const upperBound = useMemo(() => Math.min(page * ITEMS_PER_PAGE, totalItems), [totalItems, page])

  const pages = useMemo(() => Math.ceil(data.length / ITEMS_PER_PAGE), [data])
  const isCenterAligment = useMediaQuery(theme.breakpoints.down(1280))
  const height = useMemo(
    () => (initialDataLength > ITEMS_PER_PAGE ? (isCenterAligment ? 176 : 90) : 79),
    [initialDataLength, isCenterAligment]
  )

  return (
    <>
      <Typography className={classes.subheader} mt={isSm ? '24px' : '72px'}>
        Top tokens
      </Typography>
      <Grid container className={classes.headerWrapper}>
        <Grid container className={classes.tableHeader}>
          {!isSm && (
            <Button className={classes.showFavouritesButton} onClick={handleFavouritesClick}>
              <img src={showFavourites ? starFill : star} />
              {!isMd && (
                <Typography className={classes.showFavouritesText}>
                  {!showFavourites ? 'Show ' : 'Hide '}favourites
                </Typography>
              )}
            </Button>
          )}
          <Grid className={classes.headerContainer}>
            {!isSm && (
              <Box className={classes.sortWrapper}>
                <SortTypeSelector
                  currentSort={sortType}
                  sortGroups={tokenSortGroups}
                  onSelect={setSortType}
                />
              </Box>
            )}

            <FilterSearch
              networkType={network}
              setSelectedFilters={setSearchTokensValue}
              selectedFilters={searchTokensValue}
              filtersAmount={2}
              closeOnSelect={true}
              width={isMd ? 250 : 350}
            />
          </Grid>
        </Grid>
        {isSm && (
          <Grid container className={classes.headerRow}>
            <Button className={classes.showFavouritesButton} onClick={handleFavouritesClick}>
              <img src={showFavourites ? starFill : star} />
              {!isSm && (
                <Typography className={classes.showFavouritesText}>
                  {!showFavourites ? 'Show' : 'Hide'} {!isSm && 'favourites'}
                </Typography>
              )}
            </Button>

            <Box className={classes.sortWrapper}>
              <SortTypeSelector
                currentSort={sortType}
                onSelect={setSortType}
                sortGroups={tokenSortGroups}
                fullWidth={isSm}
              />
            </Box>
          </Grid>
        )}
      </Grid>
      <Grid
        container
        classes={{ root: classes.container }}
        className={cx({ [classes.loadingOverlay]: isLoading })}>
        <>
          {data.length > 0 || isLoading ? (
            <>
              {paginator(page).data.map((token, index) => {
                return (
                  <TokenListItem
                    key={index}
                    itemNumber={index + 1 + (page - 1) * ITEMS_PER_PAGE}
                    icon={token.icon}
                    name={token.name}
                    symbol={token.symbol}
                    price={token.price}
                    // priceChange={token.priceChange}
                    volume={token.volume}
                    TVL={token.TVL}
                    address={token.address}
                    isUnknown={token.isUnknown}
                    network={network}
                    copyAddressHandler={copyAddressHandler}
                    interval={interval}
                    isFavourite={token.isFavourite}
                    switchFavouriteTokens={switchFavouriteTokens}
                  />
                )
              })}
              {getEmptyRowsCount() > 0 &&
                new Array(getEmptyRowsCount()).fill('').map((_, index) => (
                  <div
                    key={`empty-row-${index}`}
                    style={{
                      borderBottom:
                        getEmptyRowsCount() - 1 === index
                          ? `2px solid ${colors.invariant.light}`
                          : `0px solid ${colors.invariant.light}`
                    }}
                    className={cx(classes.emptyRow)}
                  />
                ))}
            </>
          ) : (
            <Grid container className={classes.emptyContainer}>
              <EmptyPlaceholder
                height={initialDataLength < ITEMS_PER_PAGE ? initialDataLength * 79 : 688}
                newVersion
                mainTitle={`You don't have any favourite tokens yet...`}
                desc={'You can add them by clicking the star icon next to the token!'}
                withButton={false}
              />
            </Grid>
          )}
          <Grid
            className={classes.pagination}
            sx={{
              height: height
            }}>
            {pages > 0 && (
              <InputPagination
                pages={pages}
                defaultPage={page}
                handleChangePage={handleChangePagination}
                variant='center'
                page={page}
                borderTop={false}
                pagesNumeration={{
                  lowerBound: lowerBound,
                  totalItems: totalItems,
                  upperBound: upperBound
                }}
              />
            )}
          </Grid>
        </>
      </Grid>
    </>
  )
}

export default TokensList
