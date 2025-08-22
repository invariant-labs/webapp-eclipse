import React from 'react'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { formatNumberWithoutSuffix, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import RouteBox from './RouteBox/RouteBox'
import { DENOMINATOR } from '@invariant-labs/sdk-eclipse/src'
import { SimulationPath } from '@components/Swap/Swap'

interface IProps {
  open: boolean
  exchangeRate: { val: number; symbol: string; decimal: number }
  slippage?: number
  priceImpact?: number
  isLoadingRate?: boolean
  simulationPath?: SimulationPath
  feeTier?: string
  makerProfit?: { percentage: string; value: string; tokenSymbol: string }
  platformFee?: string
}

const TransactionDetailsBox: React.FC<IProps> = ({
  open,
  exchangeRate,
  slippage,
  priceImpact,
  isLoadingRate = false,
  simulationPath,
  feeTier,
  makerProfit,
  platformFee
}) => {
  const { classes } = useStyles({ open })

  const feePercent = simulationPath
    ? Number(
        printBN(
          simulationPath.firstPair?.feeTier.fee.add(
            DENOMINATOR.sub(simulationPath.firstPair?.feeTier.fee)
              .mul(simulationPath.secondPair?.feeTier.fee ?? new BN(0))
              .div(DENOMINATOR) ?? new BN(0)
          ) ?? new BN(0),
          DECIMAL - 2
        )
      )
    : null

  return (
    <Grid container className={classes.wrapper}>
      {simulationPath && <RouteBox simulationPath={simulationPath} isLoadingRate={isLoadingRate} />}
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

        {(feePercent || feeTier) && (
          <Grid container className={classes.row}>
            <Typography className={classes.label}>{feeTier ? 'Pool fee:' : 'Fee:'}</Typography>
            {isLoadingRate ? (
              <Skeleton width={80} height={20} variant='rounded' animation='wave' />
            ) : (
              <Typography className={classes.value}>
                {feeTier ? feeTier : `${feePercent?.toFixed(2)}%`}
              </Typography>
            )}
          </Grid>
        )}

        {priceImpact && (
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
        )}
        {slippage && (
          <Grid container className={classes.row}>
            <Typography className={classes.label}>Slippage tolerance:</Typography>
            <Typography className={classes.value}>{slippage}%</Typography>
          </Grid>
        )}
        {platformFee && (
          <Grid container className={classes.row}>
            <Typography className={classes.label}>Platform fee:</Typography>
            <Typography className={classes.value}>{platformFee}%</Typography>
          </Grid>
        )}
        {makerProfit && (
          <>
            <Grid container className={classes.row}>
              <Typography className={classes.label}>Order maker profit:</Typography>
              <Box display='flex' alignItems={'center'}>
                <Typography className={classes.value} mr={'4px'}>
                  {formatNumberWithoutSuffix(makerProfit.value) + ' ' + makerProfit.tokenSymbol}
                </Typography>
                <Typography className={classes.value}>- {makerProfit.percentage}% </Typography>
              </Box>
            </Grid>
            <Grid container className={classes.row}>
              <div />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  )
}

export default TransactionDetailsBox
