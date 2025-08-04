import React from 'react'
import { Box, Button, Grid } from '@mui/material'
import { useStyles } from './styles'
import Switcher from '@common/Switcher/Switcher'
import { OrdersHistory } from '@store/reducers/navigation'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import { NetworkType, SOL_MAIN, USDC_MAIN } from '@store/consts/static'
import OrderItem from './OrderItem/OrderItem'
import { SwapToken } from '@store/selectors/solanaWallet'

interface IProps {
  handleSwitcher: (e: OrdersHistory) => void
  swicherType: OrdersHistory
  handleRefresh: () => void
  currentNetwork: NetworkType
  selectedFilters: ISearchToken[]
  setSelectedFilters: (tokens: ISearchToken[]) => void

  tokensDict: Record<string, SwapToken>
}

const OrderHistory: React.FC<IProps> = ({
  handleSwitcher,
  swicherType,
  handleRefresh,
  currentNetwork,
  selectedFilters,
  setSelectedFilters,
  tokensDict
}) => {
  const { classes } = useStyles()

  const orders = []
  return (
    <Grid className={classes.wrapper}>
      <Switcher
        onChange={handleSwitcher}
        options={[OrdersHistory.your, OrdersHistory.history]}
        value={swicherType}
        fullWidth
        padding={2}
        buttonsHeight={44}
        biggerFont
      />
      <Grid container display={'flex'} flexDirection={'column'} mt={'24px'}>
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
          {orders.map(() => {
            return null
          })}

          <OrderItem
            tokenX={tokensDict[USDC_MAIN.address.toString()]}
            tokenY={tokensDict[SOL_MAIN.address.toString()]}
            amount={123}
            handleCloseOrder={() => {}}
            orderFilled={79.45565}
            price={221}
            itemNumber={0}
          />
          <OrderItem
            tokenX={tokensDict[USDC_MAIN.address.toString()]}
            tokenY={tokensDict[SOL_MAIN.address.toString()]}
            amount={123}
            handleCloseOrder={() => {}}
            orderFilled={79.45565}
            price={221}
            itemNumber={0}
          />
          <OrderItem
            tokenX={tokensDict[USDC_MAIN.address.toString()]}
            tokenY={tokensDict[SOL_MAIN.address.toString()]}
            amount={123}
            handleCloseOrder={() => {}}
            orderFilled={79.45565}
            price={221}
            itemNumber={0}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderHistory
