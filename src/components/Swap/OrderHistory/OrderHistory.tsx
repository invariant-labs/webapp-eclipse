import React, { useEffect, useMemo, useState } from 'react'
import { alpha, Box, Button, Grid, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './styles'
import { OrdersHistory } from '@store/reducers/navigation'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import { BTC_TEST, NetworkType, WETH_TEST } from '@store/consts/static'
import OrderItem from './OrderItem/OrderItem'
import { SwapToken } from '@store/selectors/solanaWallet'
import { colors, theme, typography } from '@static/theme'
import { printBN } from '@utils/utils'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { Keypair, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { UserOrdersFullData } from '@store/consts/types'
import { Status } from '@store/reducers/solanaWallet'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/navigation'
import { swapSearch } from '@store/selectors/navigation'
import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'
import { InputPagination } from '@common/Pagination/InputPagination/InputPagination'
import OrderItemPlaceholder from './OrderItemPlaceholder/OrderItemPlaceholder'

const ORDERS_PER_PAGE = 5

const generateMockData = () => {
  return Array.from({ length: ORDERS_PER_PAGE }, _ => ({
    account: {
      age: 1,
      bump: 1,
      orderTokenAmount: 123123123,
      owner: Keypair.generate().publicKey.toString(),
      pool: Keypair.generate().publicKey.toString(),
      seed: 123,
      tickIndex: 555,
      xToY: true
    },
    publicKey: Keypair.generate().publicKey.toString(),
    poolData: { address: Keypair.generate().publicKey.toString() },
    tokenFrom: BTC_TEST,
    tokenTo: WETH_TEST,
    filledPercentage: 0,
    amountPrice: 100,
    pair: Keypair.generate(),
    orderValue: Math.random() * 10000
  }))
}

interface IProps {
  handleSwitcher: (e: OrdersHistory) => void
  swicherType: OrdersHistory
  handleRefresh: () => void
  currentNetwork: NetworkType
  selectedFilters: ISearchToken[]
  setSelectedFilters: (tokens: ISearchToken[]) => void
  tokensDict: Record<string, SwapToken>
  userOrders: UserOrdersFullData[]
  handleRemoveOrder: (pair: Pair, orderKey: PublicKey, amount: BN) => void
  walletStatus: Status
  isLoading: boolean
}

const OrderHistory: React.FC<IProps> = ({
  // handleSwitcher,
  swicherType,
  handleRefresh,
  currentNetwork,
  selectedFilters,
  setSelectedFilters,
  userOrders,
  handleRemoveOrder,
  isLoading
}) => {
  const dispatch = useDispatch()
  const { classes, cx } = useStyles()

  const searchParams = useSelector(swapSearch)
  const page = searchParams.pageNumber

  const [initialDataLength, setInitialDataLength] = useState(userOrders.length)

  useEffect(() => {
    setInitialDataLength(userOrders.length)
  }, [userOrders.length])
  const orderList = useMemo(() => {
    if (isLoading) {
      return generateMockData()
    }

    if (swicherType === OrdersHistory.your) {
      return userOrders
    } else {
      return []
    }
  }, [swicherType, userOrders.length, isLoading])

  const handleChangePagination = (newPage: number) => {
    dispatch(
      actions.setSearch({
        section: 'swapTokens',
        type: 'pageNumber',
        pageNumber: newPage
      })
    )
  }

  function paginator(currentPage: number) {
    const page = currentPage || 1
    const offset = (page - 1) * ORDERS_PER_PAGE
    const paginatedItems = userOrders.slice(offset).slice(0, ORDERS_PER_PAGE)
    const totalPages = Math.ceil(userOrders.length / ORDERS_PER_PAGE)

    return {
      page: page,
      totalPages: totalPages,
      data: paginatedItems
    }
  }

  const totalItems = useMemo(() => userOrders.length, [userOrders])
  const lowerBound = useMemo(() => (page - 1) * ORDERS_PER_PAGE + 1, [page])
  const upperBound = useMemo(() => Math.min(page * ORDERS_PER_PAGE, totalItems), [totalItems, page])

  const pages = useMemo(() => Math.ceil(userOrders.length / ORDERS_PER_PAGE), [userOrders.length])
  const isCenterAligment = useMediaQuery(theme.breakpoints.down(1280))
  const height = useMemo(
    () => (initialDataLength > ORDERS_PER_PAGE ? (isCenterAligment ? 176 : 90) : 60),
    [initialDataLength, isCenterAligment]
  )

  return (
    <Grid className={classes.wrapper}>
      {/* <Switcher
        onChange={handleSwitcher}
        options={[OrdersHistory.your, OrdersHistory.history]}
        value={swicherType}
        fullWidth
        padding={2}
        buttonsHeight={44}
        biggerFont
      /> */}
      <Box display='flex'>
        <Typography style={{ ...typography.heading4 }} color={colors.invariant.text}>
          Your orders
        </Typography>
        <TooltipHover title='Total number of your limit orders'>
          <Typography className={classes.ordersNumber}>{String(orderList.length)}</Typography>
        </TooltipHover>
      </Box>
      <Grid container display={'flex'} flexDirection={'column'} mt={'12px'}>
        <Box className={classes.header}>
          <TooltipHover title='Refresh'>
            <Grid display='flex' alignItems='center' mb={1}>
              <Button onClick={handleRefresh} className={classes.refreshIconBtn}>
                <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
              </Button>
            </Grid>
          </TooltipHover>
          <FilterSearch
            loading={false}
            bp='md'
            networkType={currentNetwork}
            filtersAmount={2}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
        </Box>

        <Box
          className={cx(classes.tableHeader, { [classes.loadingOverlayHeader]: isLoading })}
          sx={{
            background:
              userOrders.length > 0
                ? colors.invariant.component
                : alpha(colors.invariant.black, 0.1)
          }}
        />

        <Grid
          container
          classes={{ root: classes.container }}
          className={cx({
            [classes.loadingOverlay]: isLoading
          })}>
          <>
            {userOrders.length > 0 ? (
              <Box minHeight={92 * ORDERS_PER_PAGE}>
                {paginator(page).data.map((order, index) => {
                  return isLoading ? (
                    <OrderItemPlaceholder />
                  ) : (
                    <OrderItem
                      tokenX={order.tokenFrom}
                      tokenY={order.tokenTo}
                      amount={+printBN(order.account.orderTokenAmount, order.tokenFrom.decimals)}
                      handleCloseOrder={() =>
                        handleRemoveOrder(
                          order.pair,
                          order.publicKey,
                          order.account.orderTokenAmount
                        )
                      }
                      orderFilled={order.filledPercentage}
                      price={order.amountPrice}
                      itemNumber={order.publicKey.toString() + index}
                      usdValue={order.usdValue}
                      isXtoY={order.account.xToY}
                    />
                  )
                })}
              </Box>
            ) : (
              <Grid container className={classes.emptyContainer}>
                <EmptyPlaceholder
                  height={initialDataLength < ORDERS_PER_PAGE ? initialDataLength * 79 : 688}
                  newVersion
                  mainTitle={`You don't have any limit orders yet...`}
                  desc={''}
                  withButton={false}
                />
              </Grid>
            )}
            <Grid
              className={classes.pagination}
              sx={{
                height: height
              }}>
              {pages > 1 && (
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

        {/* <Grid className={classes.listContainer}>
          {orderList.length ? (
            <>
              {orderList.map((order, index) => {
                return (
                  <OrderItem
                    tokenX={order.tokenFrom}
                    tokenY={order.tokenTo}
                    amount={+printBN(order.account.orderTokenAmount, order.tokenFrom.decimals)}
                    handleCloseOrder={() =>
                      handleRemoveOrder(order.pair, order.publicKey, order.account.orderTokenAmount)
                    }
                    orderFilled={order.filledPercentage}
                    price={order.amountPrice}
                    itemNumber={order.publicKey.toString() + index}
                    orderValue={order.orderValue}
                    isXtoY={order.account.xToY}
                  />
                )
              })}
            </>
          ) : (
            <Grid
              container
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              minHeight={'100px'}>
              <Typography style={typography.heading4} color={colors.invariant.text}>
                {walletStatus !== Status.Initialized
                  ? 'Connect wallet to see your orderes'
                  : 'Create your first limit order'}
              </Typography>
            </Grid>
          )}
        </Grid> */}
      </Grid>
    </Grid>
  )
}

export default OrderHistory
