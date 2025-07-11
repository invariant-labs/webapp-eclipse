import React from 'react'
import { Box } from '@mui/material'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { mapIntervalToString } from '@utils/uiUtils'
import { SwapToken } from '@store/selectors/solanaWallet'

export interface IProps {
  tokenX: SwapToken
  tokenY: SwapToken
  tokenXPercentage: number
  tokenYPercentage: number
}

export const PercentageScale: React.FC<IProps> = ({}) => {
  return (
    <Box display='flex' alignItems='center'>
      <Box></Box>
    </Box>
  )
}

export default PercentageScale
