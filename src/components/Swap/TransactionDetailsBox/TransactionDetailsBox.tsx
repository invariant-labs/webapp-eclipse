import React from 'react'
import { Grid, Skeleton, Typography } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './styles'
import { BN } from '@coral-xyz/anchor'

interface IProps {
  open: boolean
  exchangeRate: { val: number; symbol: string; decimal: number }
  slippage: number
  priceImpact: BN
  feePercent?: number
  isLoadingRate?: boolean
}

const TransactionDetailsBox: React.FC<IProps> = ({
  open,
  exchangeRate,
  slippage,
  feePercent,
  priceImpact,
  isLoadingRate = false
}) => {
  const { classes } = useStyles({ open })

  return (
    <Grid container className={classes.wrapper}>
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
            <Typography
              className={
                classes.value
              }>{`${feePercent ? feePercent.toFixed(2) : '-'}%`}</Typography>
          )}
        </Grid>

        <Grid container className={classes.row}>
          <Typography className={classes.label}>Price impact:</Typography>
          {isLoadingRate ? (
            <Skeleton width={80} height={20} variant='rounded' animation='wave' />
          ) : (
            <Typography className={classes.value}>
              {priceImpact && typeof priceImpact === 'number' && priceImpact < 0.01
                ? '<0.01%'
                : typeof priceImpact === 'number'
                  ? `${priceImpact.toFixed(2)}%`
                  : '-'}
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
