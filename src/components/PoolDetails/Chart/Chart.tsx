import React, { useEffect, useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import useStyles from './style'
import { NetworkType } from '@store/consts/static'
import { SwapToken } from '@store/selectors/solanaWallet'
import { PoolSnap } from '@store/reducers/stats'
import ChartUpperSection from './ChartUpperSection/ChartUpperSection'
import ChartLowerSection from './ChartLowerSection/ChartLowerSection'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { PoolChartSwitch } from '@store/consts/types'
import { VariantType } from 'notistack'
import { EmptyPlaceholder } from '@common/EmptyPlaceholder/EmptyPlaceholder'

export interface IProps {
  poolAddress: string
  copyAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  statsPoolData: PoolSnap
  tokenX: SwapToken | null
  tokenY: SwapToken | null
  handleOpenSwap: () => void
  handleOpenPosition: () => void
  isPoolDataLoading: boolean
  interval: IntervalsKeys
  isLoadingStats: boolean
  lastStatsTimestamp: number
  setChartType: (type: PoolChartSwitch) => void
  updateInterval: (interval: IntervalsKeys) => void
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  feeTierIndex: number
  isDisabled: boolean
  disabledFeeTiers: string[]
  tokens: SwapToken[]
  setTokens: (tokenX: SwapToken, tokenY: SwapToken) => void
  handleAddToken: (address: string) => void
  initialHideUnknownTokensValue: boolean
  setHideUnknownTokensValue: (value: boolean) => void
  noData: boolean
  onCreateNewPool: () => void
  sameTokensError: boolean
}

export const Chart: React.FC<IProps> = ({
  poolAddress,
  copyAddressHandler,
  network,
  statsPoolData,
  tokenX,
  tokenY,
  handleOpenSwap,
  handleOpenPosition,
  isPoolDataLoading,
  interval,
  isLoadingStats,
  lastStatsTimestamp,
  setChartType,
  updateInterval,
  selectFeeTier,
  feeTiers,
  feeTiersWithTvl,
  totalTvl,
  feeTierIndex,
  isDisabled,
  disabledFeeTiers,
  tokens,
  setTokens,
  handleAddToken,
  initialHideUnknownTokensValue,
  setHideUnknownTokensValue,
  noData,
  onCreateNewPool,
  sameTokensError
}) => {
  const { classes } = useStyles()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    const timeout = setTimeout(() => {
      if (!isPoolDataLoading && !isLoadingStats) {
        setIsLoading(false)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [isPoolDataLoading, isLoadingStats])

  return (
    <Grid className={classes.wrapper}>
      <Typography className={classes.header}>Pool Details</Typography>
      <Box className={classes.container}>
        <ChartUpperSection
          copyAddressHandler={copyAddressHandler}
          handleOpenPosition={handleOpenPosition}
          handleOpenSwap={handleOpenSwap}
          isLoading={isLoading}
          network={network}
          poolAddress={poolAddress}
          tokenX={tokenX}
          tokenY={tokenY}
          selectFeeTier={selectFeeTier}
          feeTiers={feeTiers}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
          feeTierIndex={feeTierIndex}
          isDisabled={isDisabled}
          disabledFeeTiers={disabledFeeTiers}
          tokens={tokens}
          setTokens={setTokens}
          handleAddToken={handleAddToken}
          initialHideUnknownTokensValue={initialHideUnknownTokensValue}
          setHideUnknownTokensValue={setHideUnknownTokensValue}
          noData={noData}
        />
        <Box className={classes.separator} />
        {noData ? (
          <EmptyPlaceholder
            height={426}
            newVersion
            mainTitle={
              sameTokensError
                ? 'Please select different tokens'
                : `The ${tokenX?.symbol}/${tokenY?.symbol ?? ''} pool was not found...`
            }
            desc={sameTokensError ? '' : 'You can create it by yourself!'}
            desc2={sameTokensError ? '' : 'Or try to change tokens to find one!'}
            buttonName='Create Pool'
            onAction={onCreateNewPool}
            withButton={!sameTokensError}
            withImg={true}
            roundedCorners
          />
        ) : (
          <ChartLowerSection
            statsPoolData={statsPoolData}
            interval={interval}
            isLoading={isLoadingStats}
            lastStatsTimestamp={lastStatsTimestamp}
            setChartType={setChartType}
            updateInterval={updateInterval}
          />
        )}
      </Box>
    </Grid>
  )
}

export default Chart
