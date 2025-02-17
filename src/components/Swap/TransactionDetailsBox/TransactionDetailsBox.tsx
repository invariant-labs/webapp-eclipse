import React from 'react'
import { Grid, Typography } from '@mui/material'
import loadingAnimation from '@static/gif/loading.gif'
import { formatNumber, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

import RouteBox from './RouteBox/RouteBox'
import { SimulationPath } from '../Swap'

interface IProps {
  open: boolean
  exchangeRate: { val: number; symbol: string; decimal: number }
  slippage: number
  isLoadingRate?: boolean
  simulationPath: SimulationPath
}

const TransactionDetailsBox: React.FC<IProps> = ({
  open,
  exchangeRate,
  slippage,
  isLoadingRate = false,
  simulationPath
}) => {
  const { classes } = useStyles({ open })

  const feePercent = Number(
    printBN(
      simulationPath.firstFee?.add(simulationPath.secondFee ?? new BN(0)) ?? new BN(0),
      DECIMAL - 2
    )
  )
  const impact = +printBN(
    simulationPath.firstPriceImpact?.add(simulationPath.secondPriceImpact ?? new BN(0)) ??
      new BN(0),
    DECIMAL - 2
  )

  return (
    <Grid container className={classes.wrapper}>
      <RouteBox simulationPath={simulationPath} />
      <Grid container direction='column' wrap='nowrap' className={classes.innerWrapper}>
        <Grid container justifyContent='space-between' className={classes.row}>
          <Typography className={classes.label}>Exchange rate:</Typography>
          {isLoadingRate ? (
            <img src={loadingAnimation} className={classes.loading} alt='Loading' />
          ) : (
            <Typography className={classes.value}>
              {exchangeRate.val === Infinity
                ? '-'
                : `${formatNumber(exchangeRate.val.toFixed(exchangeRate.decimal)) === '0' ? '~0' : formatNumber(exchangeRate.val.toFixed(exchangeRate.decimal))} ${exchangeRate.symbol}`}
            </Typography>
          )}
        </Grid>

        <Grid container justifyContent='space-between' className={classes.row}>
          <Typography className={classes.label}>Fee:</Typography>
          <Typography className={classes.value}>{`${feePercent}%`}</Typography>
        </Grid>

        <Grid container justifyContent='space-between' className={classes.row}>
          <Typography className={classes.label}>Price impact:</Typography>
          <Typography className={classes.value}>
            {impact < 0.01 ? '<0.01%' : `${impact.toFixed(2)}%`}
          </Typography>
        </Grid>
        <Grid container justifyContent='space-between' className={classes.row}>
          <Typography className={classes.label}>Slippage tolerance:</Typography>
          <Typography className={classes.value}>{slippage}%</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TransactionDetailsBox
