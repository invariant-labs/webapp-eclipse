import React from 'react'
import { Box } from '@mui/material'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import InfoItem from './InfoItem/InfoItem'
import { mapIntervalToString } from '@utils/uiUtils'
import { formatNumberWithoutSuffix } from '@utils/utils'

export interface IProps {
  statsPoolData: PoolSnap
  interval: IntervalsKeys
  isLoadingStats: boolean
}

export const InfoUpperSection: React.FC<IProps> = ({ statsPoolData, interval, isLoadingStats }) => {
  const intervalSuffix = mapIntervalToString(interval)
  console.log(statsPoolData.apy)
  return (
    <Box display='flex' justifyContent='space-between' alignItems='center'>
      <InfoItem
        name='Pool APY'
        value={
          statsPoolData.apy > 1000 ? '>1000%' : `${formatNumberWithoutSuffix(statsPoolData.apy)}%`
        }
        isLoadingStats={isLoadingStats}
        isGreen
      />
      <InfoItem
        name={`TVL (${intervalSuffix})`}
        value={`${formatNumberWithoutSuffix(statsPoolData.tvl)}USD`}
        isLoadingStats={isLoadingStats}
      />
      <InfoItem
        name={`Volume (${intervalSuffix})`}
        value={`${formatNumberWithoutSuffix(statsPoolData.volume)}USD`}
        isLoadingStats={isLoadingStats}
      />
      <InfoItem
        name={`Fees (${intervalSuffix})`}
        value={`${formatNumberWithoutSuffix(statsPoolData.fees)}USD`}
        isLoadingStats={isLoadingStats}
      />
    </Box>
  )
}

export default InfoUpperSection
