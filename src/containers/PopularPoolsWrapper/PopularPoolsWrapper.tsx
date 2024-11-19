import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PopularPools from '@components/PopularPools/PopularPools'
import { isLoading, poolsStatsWithTokensDetails } from '@store/selectors/stats'
import icons from '@static/icons'
import { actions } from '@store/reducers/stats'
import { Grid } from '@mui/material'
import { network } from '@store/selectors/solanaConnection'

export interface PopularPoolData {
  symbolFrom: string
  symbolTo: string
  iconFrom: string
  iconTo: string
  volume: number
  TVL: number
  fee: number
  addressFrom: string
  addressTo: string
  apy: number
  apyData: {
    fees: number
    accumulatedFarmsAvg: number
    accumulatedFarmsSingleTick: number
  }
  isUnknownFrom: boolean
  isUnknownTo: boolean
}

export const PopularPoolsWrapper: React.FC = () => {
  const dispatch = useDispatch()

  const currentNetwork = useSelector(network)

  const isLoadingStats = useSelector(isLoading)
  const poolsList = useSelector(poolsStatsWithTokensDetails)

  const data: PopularPoolData[] = []
  for (let i = 0; i < 4; i++) {
    if (!poolsList[i]) {
      break
    }
    data.push({
      symbolFrom: poolsList[i]?.tokenXDetails?.symbol ?? poolsList[i].tokenX.toString(),
      symbolTo: poolsList[i]?.tokenYDetails?.symbol ?? poolsList[i].tokenY.toString(),
      iconFrom: poolsList[i]?.tokenXDetails?.logoURI ?? icons.unknownToken,
      iconTo: poolsList[i]?.tokenYDetails?.logoURI ?? icons.unknownToken,
      volume: poolsList[i].volume24,
      TVL: poolsList[i].tvl,
      fee: poolsList[i].fee,
      addressFrom: poolsList[i].tokenX.toString(),
      addressTo: poolsList[i].tokenY.toString(),
      apy: poolsList[i].apy,
      apyData: {
        fees: poolsList[i].apy,
        accumulatedFarmsSingleTick: 0,
        accumulatedFarmsAvg: 0
      },
      isUnknownFrom: poolsList[i].tokenXDetails?.isUnknown ?? false,
      isUnknownTo: poolsList[i].tokenYDetails?.isUnknown ?? false
    })
  }

  useEffect(() => {
    dispatch(actions.getCurrentStats())
  }, [])

  return (
    <Grid container>
      <PopularPools pools={data} isLoading={isLoadingStats} network={currentNetwork} />
    </Grid>
  )
}

export default PopularPoolsWrapper
