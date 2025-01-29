import React from 'react'
import { Grid, Typography } from '@mui/material'
import loadingAnimation from '@static/gif/loading.gif'
import { formatNumber, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'

import RouteBox from './RouteBox/RouteBox'
import { SwapToken } from '@store/selectors/solanaWallet'

interface IProps {
  tokenFrom: SwapToken | null
  tokenTo: SwapToken | null
  open: boolean
  fee: BN
  exchangeRate: { val: number; symbol: string; decimal: number }
  slippage: number
  priceImpact: BN
  isLoadingRate?: boolean
}

const TransactionDetailsBox: React.FC<IProps> = ({
  open,
  tokenFrom,
  tokenTo,
  fee,
  exchangeRate,
  slippage,
  priceImpact,
  isLoadingRate = false
}) => {
  const { classes } = useStyles({ open })

  const feePercent = Number(printBN(fee, DECIMAL - 2))
  const impact = +printBN(priceImpact, DECIMAL - 2)

  return (
    <Grid container className={classes.wrapper}>
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
      <RouteBox
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        baseFee={fee}
        onePoolType={true}
        tokenBetween={null}
        firstFee={null}
        secondFee={null}
        amountIn={null}
        amountOut={null}
      />
      <RouteBox
        tokenFrom={tokenFrom}
        tokenTo={tokenTo}
        baseFee={fee}
        onePoolType={false}
        tokenBetween={null}
        firstFee={null}
        secondFee={null}
        amountIn={null}
        amountOut={null}
      />
    </Grid>
  )
}

export default TransactionDetailsBox
