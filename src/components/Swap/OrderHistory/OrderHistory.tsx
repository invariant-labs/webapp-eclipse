import React, { useMemo } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useStyles } from './styles'
import { OrdersHistory } from '@store/reducers/navigation'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import { NetworkType } from '@store/consts/static'
import OrderItem from './OrderItem/OrderItem'
import { SwapToken } from '@store/selectors/solanaWallet'
import { colors, typography } from '@static/theme'
import { printBN } from '@utils/utils'
import { Pair } from '@invariant-labs/sdk-eclipse'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { UserOrdersFullData } from '@store/consts/types'

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
}

const OrderHistory: React.FC<IProps> = ({
  // handleSwitcher,
  swicherType,
  handleRefresh,
  currentNetwork,
  selectedFilters,
  setSelectedFilters,
  tokensDict,
  userOrders,
  handleRemoveOrder
}) => {
  const { classes } = useStyles()

  const orderList = useMemo(() => {
    if (swicherType === OrdersHistory.your) {
      return userOrders
    } else {
      return []
    }
  }, [swicherType, userOrders.length])

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
      <Typography style={{ ...typography.heading4 }} color={colors.invariant.text}>
        Your orders
      </Typography>
      <Grid container display={'flex'} flexDirection={'column'} mt={'12px'}>
        <Box className={classes.header}>
          <TooltipHover title='Refresh'>
            <Grid display='flex' alignItems='center'>
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

        <Grid className={classes.listContainer}>
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
                Create your first limit order
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderHistory
