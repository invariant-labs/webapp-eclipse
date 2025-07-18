import React from 'react'
import { Grid, Typography } from '@mui/material'
import useStyles from './style'
import Chart from './Chart/Chart'
import PoolInfo from './PoolInfo/PoolInfo'
import { NetworkType } from '@store/consts/static'
import { PoolSnap } from '@store/reducers/stats'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PoolWithAddress } from '@store/reducers/pools'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { PoolChartSwitch, TokenReserve } from '@store/consts/types'
import { VariantType } from 'notistack'
import { backIcon } from '@static/icons'

export interface IProps {
  network: NetworkType
  statsPoolData: PoolSnap
  tokenX: SwapToken | null
  tokenY: SwapToken | null
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
  tokenXReserve: TokenReserve | null
  tokenYReserve: TokenReserve | null
  prices: { tokenX: number; tokenY: number }
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  initialFee: string
  handleBack: () => void
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  feeTierIndex: number
  onRefresh: () => void
}

export const PoolDetails: React.FC<IProps> = ({
  network,
  statsPoolData,
  tokenX,
  tokenY,
  handleOpenSwap,
  handleOpenPosition,
  poolData,
  isPoolDataLoading,
  interval,
  isLoadingStats,
  lastStatsTimestamp,
  setChartType,
  copyAddressHandler,
  updateInterval,
  tokenXReserve,
  tokenYReserve,
  prices,
  selectFeeTier,
  feeTiers,
  initialFee,
  handleBack,
  feeTiersWithTvl,
  totalTvl,
  feeTierIndex,
  onRefresh
}) => {
  const { classes } = useStyles()
  console.log(initialFee)
  return (
    <Grid className={classes.wrapper}>
      <Grid onClick={() => handleBack()} className={classes.back} container item>
        <img className={classes.backIcon} src={backIcon} alt='back' />
        <Typography className={classes.backText}>Back</Typography>
      </Grid>
      <Grid className={classes.upperContainer}>
        <Chart
          poolAddress={poolData?.address.toString() ?? ''}
          copyAddressHandler={copyAddressHandler}
          network={network}
          statsPoolData={statsPoolData}
          tokenX={tokenX}
          tokenY={tokenY}
          handleOpenSwap={handleOpenSwap}
          handleOpenPosition={handleOpenPosition}
          isPoolDataLoading={isPoolDataLoading}
          interval={interval}
          isLoadingStats={isLoadingStats}
          lastStatsTimestamp={lastStatsTimestamp}
          setChartType={setChartType}
          updateInterval={updateInterval}
          selectFeeTier={selectFeeTier}
          feeTiers={feeTiers}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
          feeTierIndex={feeTierIndex}
        />
        <PoolInfo
          interval={interval}
          statsPoolData={statsPoolData}
          isLoadingStats={isLoadingStats}
          tokenX={tokenX}
          tokenY={tokenY}
          tokenXReserve={tokenXReserve}
          tokenYReserve={tokenYReserve}
          prices={prices}
          copyAddressHandler={copyAddressHandler}
          network={network}
          onRefresh={onRefresh}
        />
      </Grid>
      {/* <Transactions /> */}
    </Grid>
  )
}

export default PoolDetails
