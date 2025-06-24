import React from 'react'
import { Box } from '@mui/system'
import { Skeleton, Typography } from '@mui/material'
import useStyles from './style'

interface ITransactionDetails {
  tokenFromTicker: string
  tokenToTicker: string
  tokenToAmount: string
  stakedDataLoading: boolean
}

const TransactionDetails: React.FC<ITransactionDetails> = ({
  tokenFromTicker,
  tokenToTicker,
  tokenToAmount,
  stakedDataLoading
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
        <Typography className={classes.label}>Fees</Typography>
        <Typography className={classes.value}>Free</Typography>
      </Box>
    </Box>
  )
}

export default TransactionDetails
