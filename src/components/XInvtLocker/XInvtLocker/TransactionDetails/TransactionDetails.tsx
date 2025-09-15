import React from 'react'
import { Box } from '@mui/system'
import { Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import { formatNumberWithSuffix } from '@utils/utils'

interface ITransactionDetails {
  tokenFromTicker: string
  tokenFromAmount: string
  tokenToTicker: string
  tokenToAmount: string
  stakedDataLoading: boolean
  currentYield: number
  yieldChange: number
  income: number
}

const TransactionDetails: React.FC<ITransactionDetails> = ({
  tokenFromTicker,
  tokenFromAmount,
  tokenToTicker,
  tokenToAmount,
  stakedDataLoading,
  currentYield,
  yieldChange,
  income
}) => {
  const { classes } = useStyles()

  const isYieldDifference = yieldChange.toFixed(2) !== currentYield.toFixed(2)
  return (
    <Box className={classes.wrapper}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.label}>Exchange rate</Typography>
        {stakedDataLoading ? (
          <Skeleton width={125} height={24} />
        ) : (
          <Typography className={classes.value}>
            1 {tokenFromTicker} = {Number(tokenToAmount).toFixed(0)} {tokenToTicker}
          </Typography>
        )}
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Yield change impact</Typography>
        <Typography className={classes.value}>
          {isYieldDifference
            ? currentYield.toFixed(2) + ' %' + ' ⟶ ' + yieldChange.toFixed(2) + ' %'
            : yieldChange.toFixed(2) + ' %'}
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Predicted income</Typography>
        <Typography className={classes.value}>
          {tokenFromAmount ? tokenFromAmount + ' +' : ''} {formatNumberWithSuffix(income)} INVT
        </Typography>
      </Box>
    </Box>
  )
}

export default TransactionDetails
