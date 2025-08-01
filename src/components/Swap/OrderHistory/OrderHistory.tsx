import React from 'react'
import { Box, Button, Grid } from '@mui/material'
import { useStyles } from './styles'
import Switcher from '@common/Switcher/Switcher'
import { OrdersHistory } from '@store/reducers/navigation'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { refreshIcon } from '@static/icons'
import { FilterSearch, ISearchToken } from '@common/FilterSearch/FilterSearch'
import { NetworkType } from '@store/consts/static'

interface IProps {
  handleSwitcher: (e: OrdersHistory) => void
  swicherType: OrdersHistory
  handleRefresh: () => void
  currentNetwork: NetworkType
  selectedFilters: ISearchToken[]
  setSelectedFilters: (tokens: ISearchToken[]) => void
}

const OrderHistory: React.FC<IProps> = ({
  handleSwitcher,
  swicherType,
  handleRefresh,
  currentNetwork,
  selectedFilters,
  setSelectedFilters
}) => {
  const { classes } = useStyles()

  return (
    <Grid mt={'24px'}>
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
        <Grid className={classes.container}></Grid>
      </Grid>
    </Grid>
  )
}

export default OrderHistory
