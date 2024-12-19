import { Box, Typography } from '@mui/material'
import useStyles from './styles'
import React, { useMemo } from 'react'
import PoolList from '../PoolList/PoolList'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'
import icons from '@static/icons'
import { ExtendedPoolStatsData } from '@store/selectors/stats'

interface IProps {
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  rewardedPoolsData: ExtendedPoolStatsData[]
}

export const RewardedPools: React.FC<IProps> = ({
  network,
  copyAddressHandler,
  rewardedPoolsData
}: IProps) => {
  const { classes } = useStyles()
  const data = useMemo(
    () =>
      rewardedPoolsData.map(poolData => {
        return {
          symbolFrom: poolData.tokenXDetails?.symbol ?? poolData.tokenX.toString(),
          symbolTo: poolData.tokenYDetails?.symbol ?? poolData.tokenY.toString(),
          iconFrom: poolData.tokenXDetails?.logoURI ?? icons.unknownToken,
          iconTo: poolData.tokenYDetails?.logoURI ?? icons.unknownToken,
          volume: poolData.volume24,
          TVL: poolData.tvl,
          fee: poolData.fee,
          lockedX: poolData.lockedX,
          lockedY: poolData.lockedY,
          liquidityX: poolData.liquidityX,
          liquidityY: poolData.liquidityY,
          addressFrom: poolData.tokenX.toString(),
          addressTo: poolData.tokenY.toString(),
          apy: poolData.apy,

          apyData: {
            fees: poolData.apy,
            accumulatedFarmsSingleTick: 0,
            accumulatedFarmsAvg: 0
          },
          isUnknownFrom: poolData.tokenXDetails?.isUnknown ?? false,
          isUnknownTo: poolData.tokenYDetails?.isUnknown ?? false,
          poolAddress: poolData.poolAddress.toString()
        }
      }),
    [rewardedPoolsData]
  )

  return (
    <>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Rewarded Pools</Typography>

      <Box className={classes.sectionContent} width={'100%'}>
        <PoolList
          data={data}
          network={network}
          copyAddressHandler={copyAddressHandler}
          isLoading={false}
          showAPY={true}
        />
      </Box>
    </>
  )
}
