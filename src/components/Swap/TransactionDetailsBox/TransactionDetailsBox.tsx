import React from 'react'
import { Grid, Skeleton, Typography } from '@mui/material'
import { formatNumberWithoutSuffix, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

import RouteBox from './RouteBox/RouteBox'
import { SimulationPath } from '../Swap'
import { DENOMINATOR } from '@invariant-labs/sdk-eclipse/src'

interface IProps {
  open: boolean
  exchangeRate: { val: number; symbol: string; decimal: number }
  slippage: number
  priceImpact: BN
  isLoadingRate?: boolean
  simulationPath: SimulationPath
}

const TransactionDetailsBox: React.FC<IProps> = ({
  open,
  exchangeRate,
  slippage,
  priceImpact,
  isLoadingRate = false,
  simulationPath
}) => {
  const { classes } = useStyles({ open })

  const feePercent = Number(
    printBN(
      simulationPath.firstPair?.feeTier.fee.add(
        DENOMINATOR.sub(simulationPath.firstPair?.feeTier.fee)
          .mul(simulationPath.secondPair?.feeTier.fee ?? new BN(0))
          .div(DENOMINATOR) ?? new BN(0)
      ) ?? new BN(0),
      DECIMAL - 2
    )
  )

  return (
    <Grid container className={classes.wrapper}>
      <RouteBox simulationPath={simulationPath} isLoadingRate={isLoadingRate} />
      <Grid container direction='column' wrap='nowrap' className={classes.innerWrapper}>
        <Grid container justifyContent='space-between' className={classes.row}>
          <Typography className={classes.label}>Exchange rate:</Typography>
          {isLoadingRate ? (
            <Skeleton width={80} height={20} variant='rounded' animation='wave' />
          ) : (
            <Typography className={classes.value}>
              {exchangeRate.val === Infinity
                ? '-'
                : `${formatNumberWithoutSuffix(exchangeRate.val.toFixed(exchangeRate.decimal)) === '0' ? '~0' : formatNumberWithoutSuffix(exchangeRate.val.toFixed(exchangeRate.decimal))} ${exchangeRate.symbol}`}
            </Typography>
          )}
        </Grid>

        <Grid container className={classes.row}>
          <Typography className={classes.label}>Fee:</Typography>
          {isLoadingRate ? (
            <Skeleton width={80} height={20} variant='rounded' animation='wave' />
          ) : (
            <Typography className={classes.value}>{`${feePercent.toFixed(2)}%`}</Typography>
          )}
        </Grid>

        <Grid container className={classes.row}>
          <Typography className={classes.label}>Price impact:</Typography>
          {isLoadingRate ? (
            <Skeleton width={80} height={20} variant='rounded' animation='wave' />
          ) : (
            <Typography className={classes.value}>
              {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}
            </Typography>
          )}
        </Grid>
        <Grid container className={classes.row}>
          <Typography className={classes.label}>Slippage tolerance:</Typography>
          <Typography className={classes.value}>{slippage}%</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TransactionDetailsBox
