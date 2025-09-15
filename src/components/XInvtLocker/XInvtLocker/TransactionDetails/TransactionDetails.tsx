import React from 'react'
import { Box } from '@mui/system'
import { Skeleton, Typography } from '@mui/material'
import useStyles from './style'

interface ITransactionDetails {
  tokenFromTicker: string
  tokenToTicker: string
  tokenToAmount: string
  stakedDataLoading: boolean
  currentYield: string
  yieldChange: string
  income: string
}

const TransactionDetails: React.FC<ITransactionDetails> = ({
  tokenFromTicker,
  tokenToTicker,
  tokenToAmount,
  stakedDataLoading,
  currentYield,
  yieldChange,
  income
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.wrapper}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.label}>Exchange rate</Typography>
        {stakedDataLoading ? (
          <Skeleton width={125} height={24} />
        ) : (
          <Typography className={classes.value}>
            1 {tokenFromTicker} = {Number(tokenToAmount).toFixed(4)} {tokenToTicker}
          </Typography>
        )}
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Yield change impact</Typography>
        <Typography className={classes.value}>
          {currentYield} {yieldChange}
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Predicted income</Typography>
        <Typography className={classes.value}>{income} INVT</Typography>
      </Box>
    </Box>
  )
}

export default TransactionDetails
