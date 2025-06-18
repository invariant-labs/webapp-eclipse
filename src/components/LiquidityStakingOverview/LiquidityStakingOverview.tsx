import React from 'react'
import useStyles from './style'
import { Grid } from '@mui/material'

import { LiquidityStakingRow } from './LiquidityStakingRow'
import { formatNumberWithCommas } from '@utils/utils'

export interface IProps {
  compoundTime: number
  holders: number
  yieldValue: string
  sBitzValue: number
  sBitzAmount: number
}

export const LiquidityStakingOverview: React.FC<IProps> = ({
  compoundTime,
  holders,
  yieldValue,
  sBitzValue,
  sBitzAmount
}) => {
  const getUnitAndTime = (_timestamp: number) => {
    return [15, 'seconds']
  }
  const [time, unit] = getUnitAndTime(compoundTime)

  const { classes } = useStyles()
  return (
    <Grid className={classes.statsWrapper}>
      <LiquidityStakingRow
        displayValue={`${time} ${unit}`}
        title='Compound Time'
        tooltipTitle='Mocked tooltip'
      />
      <LiquidityStakingRow
        displayValue={formatNumberWithCommas(holders.toString())}
        title='Holders'
        tooltipTitle='Mocked tooltip'
      />
      <LiquidityStakingRow
        displayValue={`${yieldValue}%`}
        title='Annual Percentage Yield'
        tooltipTitle='Mocked tooltip'
        highlight
      />
      <LiquidityStakingRow
        displayValue={`${formatNumberWithCommas(sBitzAmount.toString())} sBITZ | $${formatNumberWithCommas(sBitzValue.toString())}`}
        title='Total Value Locked'
        tooltipTitle='Mocked tooltip'
      />
    </Grid>
  )
}
