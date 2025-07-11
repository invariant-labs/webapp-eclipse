import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import useStyles from './style'
import Chart from './Chart/Chart'
import PoolInfo from './PoolInfo/PoolInfo'
import { NetworkType } from '@store/consts/static'
import { PoolSnap } from '@store/reducers/stats'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PoolWithAddress } from '@store/reducers/pools'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { PoolChartSwitch } from '@store/consts/types'
import { VariantType } from 'notistack'
import { getTokenReserve } from '@utils/utils'

export interface IProps {
  network: NetworkType
  statsPoolData: PoolSnap
  tokenA: SwapToken | null
  tokenB: SwapToken | null
  handleOpenSwap: () => void
  handleOpenPosition: () => void
  poolData: PoolWithAddress | null
  isPoolDataLoading: boolean
  interval: IntervalsKeys
  isLoadingStats: boolean
  lastStatsTimestamp: number
  setChartType: (type: PoolChartSwitch) => void
  copyAddressHandler: (message: string, variant: VariantType) => void
  updateInterval: (interval: IntervalsKeys) => void
}

export const PoolDetails: React.FC<IProps> = ({
  network,
  statsPoolData,
  tokenA,
  tokenB,
  handleOpenSwap,
  handleOpenPosition,
  poolData,
  isPoolDataLoading,
  interval,
  isLoadingStats,
  lastStatsTimestamp,
  setChartType,
  copyAddressHandler,
  updateInterval
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.wrapper}>
      <Grid className={classes.upperContainer}>
        <Chart
          poolAddress={poolData?.address.toString() ?? ''}
          copyAddressHandler={copyAddressHandler}
          network={network}
          statsPoolData={statsPoolData}
          tokenA={tokenA}
          tokenB={tokenB}
          handleOpenSwap={handleOpenSwap}
          handleOpenPosition={handleOpenPosition}
          isPoolDataLoading={isPoolDataLoading}
          interval={interval}
          isLoadingStats={isLoadingStats}
          lastStatsTimestamp={lastStatsTimestamp}
          setChartType={setChartType}
          updateInterval={updateInterval}
        />
        <PoolInfo
          interval={interval}
          statsPoolData={statsPoolData}
          isLoadingStats={isLoadingStats}
        />
      </Grid>
      {/* <Transactions /> */}
    </Grid>
  )
}

export default PoolDetails
